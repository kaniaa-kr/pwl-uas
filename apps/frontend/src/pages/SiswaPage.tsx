import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { PermissionGuard } from '../components/PermissionGuard';

const API = import.meta.env.VITE_API_URL;

// Tipe data siswa
interface Kelas {
  id: string;
  nama: string;
}

interface Siswa {
  id: string;
  nis: string;
  namaLengkap: string;
  kelas: Kelas;
}

export default function SiswaPage() {
  const { token } = useAuthStore();
  const [siswas, setSiswas] = useState<Siswa[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Siswa | null>(null);

  // Form state
  const [form, setForm] = useState({
    userId: '',
    nis: '',
    namaLengkap: '',
    kelasId: '',
  });

  const headers = { Authorization: `Bearer ${token}` };

  // Ambil data siswa dan kelas
  const fetchData = async () => {
  setLoading(true);
  try {
    console.log('Token:', token); // cek token ada tidak
    const [resSiswa, resKelas] = await Promise.all([
      axios.get(`${API}/siswa`, { headers }),
      axios.get(`${API}/kelas`, { headers }),
    ]);
    console.log('Response siswa:', resSiswa.data); // cek response
    setSiswas(Array.isArray(resSiswa.data) ? resSiswa.data : resSiswa.data.data ?? []);
    setKelasList(Array.isArray(resKelas.data) ? resKelas.data : resKelas.data.data ?? []);
  } catch (err: any) {
    console.error('Error:', err.response?.data); // cek error detail
    setSiswas([]);
    setKelasList([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  // Tambah siswa
  const handleTambah = async () => {
    try {
      await axios.post(`${API}/siswa`, form, { headers });
      alert('Siswa berhasil ditambahkan!');
      setShowForm(false);
      setForm({ userId: '', nis: '', namaLengkap: '', kelasId: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal tambah siswa');
    }
  };

  // Update siswa
  const handleUpdate = async () => {
    if (!editTarget) return;
    try {
      await axios.put(`${API}/siswa/${editTarget.id}`, {
        namaLengkap: form.namaLengkap,
        kelasId: form.kelasId,
      }, { headers });
      alert('Data siswa berhasil diperbarui!');
      setEditTarget(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert('Gagal update siswa');
    }
  };

  // Hapus siswa
  const handleHapus = async (id: string, nama: string) => {
    if (!confirm(`Hapus siswa "${nama}"?`)) return;
    try {
      await axios.delete(`${API}/siswa/${id}`, { headers });
      fetchData();
    } catch (err) {
      alert('Gagal hapus siswa');
    }
  };

  // Klik tombol edit
  const bukaFormEdit = (s: Siswa) => {
    setEditTarget(s);
    setForm({ userId: '', nis: s.nis, namaLengkap: s.namaLengkap, kelasId: s.kelas.id });
    setShowForm(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">👨‍🎓 Data Siswa</h1>
        <PermissionGuard permission="create:siswa">
          <button
            onClick={() => { setEditTarget(null); setForm({ userId: '', nis: '', namaLengkap: '', kelasId: '' }); setShowForm(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Tambah Siswa
          </button>
        </PermissionGuard>
      </div>

      {/* Form Tambah / Edit */}
      {showForm && (
        <div className="bg-white border rounded p-4 mb-6 shadow-sm">
          <h2 className="font-semibold mb-3">{editTarget ? 'Edit Siswa' : 'Tambah Siswa Baru'}</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* userId hanya untuk tambah baru */}
            {!editTarget && (
              <div>
                <label className="text-sm text-gray-600">User ID</label>
                <input
                  className="w-full border rounded px-3 py-1.5 text-sm mt-1"
                  placeholder="UUID user yang sudah terdaftar"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                />
              </div>
            )}
            {!editTarget && (
              <div>
                <label className="text-sm text-gray-600">NIS</label>
                <input
                  className="w-full border rounded px-3 py-1.5 text-sm mt-1"
                  placeholder="Nomor Induk Siswa"
                  value={form.nis}
                  onChange={(e) => setForm({ ...form, nis: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="text-sm text-gray-600">Nama Lengkap</label>
              <input
                className="w-full border rounded px-3 py-1.5 text-sm mt-1"
                placeholder="Nama lengkap siswa"
                value={form.namaLengkap}
                onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Kelas</label>
              <select
                className="w-full border rounded px-3 py-1.5 text-sm mt-1"
                value={form.kelasId}
                onChange={(e) => setForm({ ...form, kelasId: e.target.value })}
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={editTarget ? handleUpdate : handleTambah}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
            >
              {editTarget ? 'Simpan Perubahan' : 'Tambah'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Tabel Siswa */}
      {loading ? (
        <p className="text-gray-400">Memuat data...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">No</th>
                <th className="border p-2 text-left">NIS</th>
                <th className="border p-2 text-left">Nama Lengkap</th>
                <th className="border p-2 text-left">Kelas</th>
                <PermissionGuard permission="update:siswa">
                  <th className="border p-2 text-left">Aksi</th>
                </PermissionGuard>
              </tr>
            </thead>
            <tbody>
              {siswas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border p-4 text-center text-gray-400">
                    Belum ada data siswa
                  </td>
                </tr>
              ) : (
                siswas.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="border p-2">{i + 1}</td>
                    <td className="border p-2">{s.nis}</td>
                    <td className="border p-2">{s.namaLengkap}</td>
                    <td className="border p-2">{s.kelas?.nama ?? '-'}</td>
                    <PermissionGuard permission="update:siswa">
                      <td className="border p-2">
                        <button
                          onClick={() => bukaFormEdit(s)}
                          className="text-blue-500 hover:underline mr-3"
                        >
                          Edit
                        </button>
                        <PermissionGuard permission="delete:siswa">
                          <button
                            onClick={() => handleHapus(s.id, s.namaLengkap)}
                            className="text-red-500 hover:underline"
                          >
                            Hapus
                          </button>
                        </PermissionGuard>
                      </td>
                    </PermissionGuard>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}