import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API = import.meta.env.VITE_API_URL;

interface RataRata {
  rataRataNilai: number;
  totalData: number;
}

interface RekapAbsensi {
  status: string;
  _count: { status: number };
}

export default function LaporanPage() {
  const { token } = useAuthStore();
  const [rataRata, setRataRata] = useState<RataRata | null>(null);
  const [rekap, setRekap] = useState<RekapAbsensi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${API}/laporan/nilai-rata-rata`, { headers }),
      axios.get(`${API}/laporan/absensi-rekap`, { headers }),
    ])
      .then(([nilaiRes, absensiRes]) => {
        setRataRata(nilaiRes.data);
        setRekap(absensiRes.data);
      })
      .catch((e) => console.error('Gagal fetch laporan:', e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Memuat laporan...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Laporan Sekolah</h1>

      {/* Laporan Nilai */}
      <div className="bg-white border rounded-lg p-5">
        <h2 className="font-semibold text-lg mb-3">📊 Laporan Nilai</h2>
        {rataRata ? (
          <div className="flex gap-6">
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {rataRata.rataRataNilai}
              </p>
              <p className="text-sm text-gray-500">Rata-rata nilai seluruh siswa</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-700">
                {rataRata.totalData}
              </p>
              <p className="text-sm text-gray-500">Total data nilai</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Belum ada data nilai.</p>
        )}
      </div>

      {/* Rekap Absensi */}
      <div className="bg-white border rounded-lg p-5">
        <h2 className="font-semibold text-lg mb-3">✅ Rekap Absensi</h2>
        {rekap.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {rekap.map((item) => {
              const warna: Record<string, string> = {
                HADIR: 'bg-green-50 border-green-200 text-green-700',
                IZIN: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                SAKIT: 'bg-blue-50 border-blue-200 text-blue-700',
                ALPHA: 'bg-red-50 border-red-200 text-red-700',
              };
              return (
                <div
                  key={item.status}
                  className={`border rounded-lg p-4 text-center ${warna[item.status] ?? 'bg-gray-50'}`}
                >
                  <p className="text-2xl font-bold">{item._count.status}</p>
                  <p className="text-sm mt-1">{item.status}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">Belum ada data absensi.</p>
        )}
      </div>
    </div>
  );
}