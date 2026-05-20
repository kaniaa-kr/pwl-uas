<<<<<<< HEAD
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API = import.meta.env.VITE_API_URL;

interface Statistik {
  totalSiswa: number;
  totalGuru: number;
  totalKelas: number;
=======
import { Users, GraduationCap, CalendarDays, BookOpenCheck } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';

export default function DashboardPage() {
  const { user } = useAuthStore();
  
  const stats = [
    { label: 'Total Siswa', value: '1,245', icon: Users, color: 'bg-blue-500', trend: '+4% bulan ini' },
    { label: 'Total Guru', value: '86', icon: GraduationCap, color: 'bg-indigo-500', trend: '+1% bulan ini' },
    { label: 'Kelas Aktif', value: '32', icon: CalendarDays, color: 'bg-purple-500', trend: 'Semester Ganjil' },
    { label: 'Rata-rata Nilai', value: '84.5', icon: BookOpenCheck, color: 'bg-emerald-500', trend: '+1.2 dari lalu' },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Selamat datang kembali, {user?.username || 'Admin'}!</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity Card */}
        <div className="lg:col-span-2 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Siswa baru ditambahkan ke Kelas X-A</p>
                  <p className="text-xs text-gray-500">2 jam yang lalu oleh Budi (Tata Usaha)</p>
                </div>
              </div>
            ))}
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
>>>>>>> 8d00cb210d9b5a3e2cd369d5db084785c646f33f
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
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-6">
        Selamat datang, <strong>{user?.username}</strong> —{' '}
        <span className="text-blue-600">{user?.roles.join(', ')}</span>
      </p>

      {/* Kartu statistik — hanya tampil kalau punya permission read:laporan */}
      {hasPermission('read:laporan') && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-center">
            <p className="text-4xl font-bold text-blue-600">
              {loading ? '...' : statistik?.totalSiswa ?? '-'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total Siswa</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center">
            <p className="text-4xl font-bold text-green-600">
              {loading ? '...' : statistik?.totalGuru ?? '-'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total Guru</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 text-center">
            <p className="text-4xl font-bold text-purple-600">
              {loading ? '...' : statistik?.totalKelas ?? '-'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total Kelas</p>
          </div>
        </div>
      )}

      {/* Info role & permission user yang login */}
      <div className="bg-white border rounded-lg p-5">
        <h2 className="font-semibold mb-3">Informasi Akun Kamu</h2>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-gray-500">Email:</span>{' '}
            <strong>{user?.email}</strong>
          </p>
          <p>
            <span className="text-gray-500">Role:</span>{' '}
            <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
              {user?.roles.join(', ')}
            </span>
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Permissions aktif: {user?.permissions.join(' · ')}
          </p>
        </div>
      </div>
    </div>
  );
}