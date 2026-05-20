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
      const [resSiswa, resKelas] = await Promise.all([
        axios.get(`${API}/siswa`, { headers }),
        axios.get(`${API}/kelas`, { headers }),
      ]);
      
      if (Array.isArray(resSiswa.data)) {
        setSiswas(resSiswa.data);
      } else if (resSiswa.data && Array.isArray(resSiswa.data.data)) {
        setSiswas(resSiswa.data.data);
      } else {
        setSiswas([]);
      }

      if (Array.isArray(resKelas.data)) {
        setKelasList(resKelas.data);
      } else if (resKelas.data && Array.isArray(resKelas.data.data)) {
        setKelasList(resKelas.data.data);
      } else {
        setKelasList([]);
      }
    } catch (err: any) {
      console.error('Error:', err.response?.data);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">👨‍🎓 Data Siswa</h1>
        <PermissionGuard permission="create:siswa">
          <button
            onClick={() => { setEditTarget(null); setForm({ userId: '', nis: '', namaLengkap: '', kelasId: '' }); setShowForm(true); }}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
          >
            + Tambah Siswa
          </button>
        </PermissionGuard>
      </div>

      {/* Form Tambah / Edit */}
      {showForm && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{editTarget ? 'Edit Siswa' : 'Tambah Siswa Baru'}</h2>
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
                {Array.isArray(kelasList) && kelasList.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={editTarget ? handleUpdate : handleTambah}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
            >
              {editTarget ? 'Simpan Perubahan' : 'Tambah'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Tabel Siswa */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">No</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">NIS</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Nama Lengkap</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Kelas</th>
                  <PermissionGuard permission="update:siswa">
                    <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Aksi</th>
                  </PermissionGuard>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {!Array.isArray(siswas) || siswas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      Belum ada data siswa
                    </td>
                  </tr>
                ) : (
                  siswas.map((s, i) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{i + 1}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{s.nis}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{s.namaLengkap}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {s.kelas?.nama ?? '-'}
                        </span>
                      </td>
                      <PermissionGuard permission="update:siswa">
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => bukaFormEdit(s)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors"
                          >
                            Edit
                          </button>
                          <PermissionGuard permission="delete:siswa">
                            <button
                              onClick={() => handleHapus(s.id, s.namaLengkap)}
                              className="text-red-600 hover:text-red-900 transition-colors"
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
    </div>
  );
}