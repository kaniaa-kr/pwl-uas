import { useEffect, useState } from 'react';
import axios from 'axios';
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