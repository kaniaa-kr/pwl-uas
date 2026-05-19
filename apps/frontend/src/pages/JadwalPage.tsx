import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { PermissionGuard } from '../components/PermissionGuard';

const API = import.meta.env.VITE_API_URL;

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

interface Jadwal {
  id: string;
  mapel: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  guru: { namaLengkap: string };
  kelas: { nama: string };
}

export default function JadwalPage() {
  const { token } = useAuthStore();
  const [jadwals, setJadwals] = useState<Jadwal[]>([]);
  const [gurus, setGurus] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Jadwal | null>(null);
  const [form, setForm] = useState({
    guruId: '', kelasId: '', mapel: '',
    hari: 'Senin', jamMulai: '', jamSelesai: '',
  });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [j, g, k] = await Promise.all([
        axios.get(`${API}/jadwal`, { headers }),
        axios.get(`${API}/guru`, { headers }),
        axios.get(`${API}/siswa`, { headers }), // ambil kelas via siswa, atau bisa tambah endpoint /kelas
      ]);
      setJadwals(j.data);
      setGurus(g.data);
    } catch {
      /* handled below */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async () => {
    try {
      if (editTarget) {
        await axios.put(`${API}/jadwal/${editTarget.id}`, form, { headers });
      } else {
        await axios.post(`${API}/jadwal`, form, { headers });
      }
      setShowForm(false);
      setEditTarget(null);
      setForm({ guruId: '', kelasId: '', mapel: '', hari: 'Senin', jamMulai: '', jamSelesai: '' });
      fetchAll();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal menyimpan jadwal');
    }
  };

  const handleEdit = (j: Jadwal) => {
    setEditTarget(j);
    setForm({
      guruId: '', kelasId: '', mapel: j.mapel,
      hari: j.hari, jamMulai: j.jamMulai, jamSelesai: j.jamSelesai,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus jadwal ini?')) return;
    await axios.delete(`${API}/jadwal/${id}`, { headers });
    fetchAll();
  };

  // Grup jadwal per hari
  const jadwalByHari = HARI.reduce((acc, hari) => {
    acc[hari] = jadwals.filter((j) => j.hari === hari);
    return acc;
  }, {} as Record<string, Jadwal[]>);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Jadwal Pelajaran</h1>
        <PermissionGuard permission="create:jadwal">
          <button
            onClick={() => { setShowForm(true); setEditTarget(null); }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Tambah Jadwal
          </button>
        </PermissionGuard>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">{editTarget ? 'Edit Jadwal' : 'Tambah Jadwal'}</h2>

            <label className="text-xs text-gray-500 mb-1 block">Guru</label>
            <select
              value={form.guruId}
              onChange={(e) => setForm({ ...form, guruId: e.target.value })}
              className="w-full border rounded px-3 py-2 mb-3 text-sm"
            >
              <option value="">-- Pilih Guru --</option>
              {gurus.map((g) => (
                <option key={g.id} value={g.id}>{g.namaLengkap} ({g.mapel})</option>
              ))}
            </select>

            <label className="text-xs text-gray-500 mb-1 block">Kelas ID</label>
            <input
              placeholder="Kelas ID (dari database)"
              value={form.kelasId}
              onChange={(e) => setForm({ ...form, kelasId: e.target.value })}
              className="w-full border rounded px-3 py-2 mb-3 text-sm"
            />

            <label className="text-xs text-gray-500 mb-1 block">Mata Pelajaran</label>
            <input
              placeholder="Mata Pelajaran"
              value={form.mapel}
              onChange={(e) => setForm({ ...form, mapel: e.target.value })}
              className="w-full border rounded px-3 py-2 mb-3 text-sm"
            />

            <label className="text-xs text-gray-500 mb-1 block">Hari</label>
            <select
              value={form.hari}
              onChange={(e) => setForm({ ...form, hari: e.target.value })}
              className="w-full border rounded px-3 py-2 mb-3 text-sm"
            >
              {HARI.map((h) => <option key={h}>{h}</option>)}
            </select>

            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Jam Mulai</label>
                <input type="time" value={form.jamMulai}
                  onChange={(e) => setForm({ ...form, jamMulai: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Jam Selesai</label>
                <input type="time" value={form.jamSelesai}
                  onChange={(e) => setForm({ ...form, jamSelesai: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded text-sm">Batal</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Tampilan per Hari */}
      {loading ? (
        <p className="text-gray-400">Memuat jadwal...</p>
      ) : (
        <div className="space-y-6">
          {HARI.map((hari) => (
            <div key={hari}>
              <h2 className="font-semibold text-gray-700 mb-2 border-b pb-1">{hari}</h2>
              {jadwalByHari[hari].length === 0 ? (
                <p className="text-sm text-gray-400 ml-2">Tidak ada jadwal</p>
              ) : (
                <div className="space-y-2">
                  {jadwalByHari[hari].map((j) => (
                    <div key={j.id} className="flex items-center justify-between bg-white border rounded px-4 py-3 shadow-sm">
                      <div>
                        <p className="font-medium text-sm">{j.mapel}</p>
                        <p className="text-xs text-gray-500">{j.guru?.namaLengkap} · {j.kelas?.nama}</p>
                        <p className="text-xs text-gray-400">{j.jamMulai} – {j.jamSelesai}</p>
                      </div>
                      <div className="flex gap-2">
                        <PermissionGuard permission="update:jadwal">
                          <button onClick={() => handleEdit(j)} className="text-blue-500 text-sm hover:underline">Edit</button>
                        </PermissionGuard>
                        <PermissionGuard permission="delete:jadwal">
                          <button onClick={() => handleDelete(j.id)} className="text-red-500 text-sm hover:underline">Hapus</button>
                        </PermissionGuard>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}