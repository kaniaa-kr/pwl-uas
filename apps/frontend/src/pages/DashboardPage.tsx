import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, GraduationCap, CalendarDays, BookOpenCheck } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';

const API = import.meta.env.VITE_API_URL;

interface Statistik {
  totalSiswa: number;
  totalGuru: number;
  totalKelas: number;
}

export default function DashboardPage() {
  const { token, user, hasPermission } = useAuthStore();
  const [statistik, setStatistik] = useState<Statistik | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Hanya fetch statistik kalau punya permission read:laporan
    if (hasPermission('read:laporan')) {
      setLoading(true);
      axios
        .get(`${API}/laporan/statistik`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((r: any) => setStatistik(r.data))
        .catch((e: any) => console.error('Gagal fetch statistik:', e))
        .finally(() => setLoading(false));
    }
  }, [hasPermission, token]);

  // Menggabungkan data API asli dengan tampilan Card UI yang baru
  const stats = [
    { label: 'Total Siswa', value: loading ? '...' : (statistik?.totalSiswa ?? '-'), icon: Users, color: 'bg-blue-500', trend: 'Data Realtime' },
    { label: 'Total Guru', value: loading ? '...' : (statistik?.totalGuru ?? '-'), icon: GraduationCap, color: 'bg-indigo-500', trend: 'Data Realtime' },
    { label: 'Kelas Aktif', value: loading ? '...' : (statistik?.totalKelas ?? '-'), icon: CalendarDays, color: 'bg-purple-500', trend: 'Data Realtime' },
  ];

  return (
    <div className="space-y-6 text-left p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            Selamat datang kembali, <strong>{user?.username || 'Admin'}</strong> —{' '}
            <span className="text-blue-600">{user?.roles?.join(', ')}</span>
          </p>
        </div>
      </div>

      {/* Kartu statistik — hanya tampil kalau punya permission read:laporan */}
      {hasPermission('read:laporan') && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} text-white shadow-inner`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-500">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Info role & permission user yang login */}
        <div className="lg:col-span-2 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Akun Kamu</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Email:</span>{' '}
              <strong>{user?.email}</strong>
            </p>
            <p>
              <span className="text-gray-500">Role:</span>{' '}
              <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
                {user?.roles?.join(', ')}
              </span>
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Permissions aktif: {user?.permissions?.join(' · ')}
            </p>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
          <div className="flex flex-col gap-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors">
              <Users className="h-4 w-4" /> Tambah Siswa
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
              <BookOpenCheck className="h-4 w-4" /> Input Nilai
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors">
              <CalendarDays className="h-4 w-4" /> Lihat Jadwal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}