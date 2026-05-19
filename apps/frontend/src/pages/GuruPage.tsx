import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { PermissionGuard } from '../components/PermissionGuard';

const API = import.meta.env.VITE_API_URL;

interface Guru {
  id: string;
  nip: string;
  namaLengkap: string;
  mapel: string;
  user: { email: string; username: string };
}

export default function GuruPage() {
  const { token } = useAuthStore();
  const [gurus, setGurus] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Guru | null>(null);
  const [form, setForm] = useState({ userId: '', nip: '', namaLengkap: '', mapel: '' });
  const [error, setError] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchGurus = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/guru`, { headers });
      setGurus(res.data);
    } catch {
      setError('Gagal memuat data guru');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGurus(); }, []);

  const handleSubmit = async () => {
    try {
      if (editTarget) {
        await axios.put(`${API}/guru/${editTarget.id}`, form, { headers });
      } else {
        await axios.post(`${API}/guru`, form, { headers });
      }
      setShowForm(false);
      setEditTarget(null);
      setForm({ userId: '', nip: '', namaLengkap: '', mapel: '' });
      fetchGurus();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const handleEdit = (guru: Guru) => {
    setEditTarget(guru);
    setForm({ userId: '', nip: guru.nip, namaLengkap: guru.namaLengkap, mapel: guru.mapel });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus data guru ini?')) return;
    await axios.delete(`${API}/guru/${id}`, { headers });
    fetchGurus();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Data Guru</h1>
        <PermissionGuard permission="create:guru">
          <button
            onClick={() => { setShowForm(true); setEditTarget(null); setForm({ userId: '', nip: '', namaLengkap: '', mapel: '' }); }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Tambah Guru
          </button>
        </PermissionGuard>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">{editTarget ? 'Edit Guru' : 'Tambah Guru'}</h2>
            {!editTarget && (
              <input
                placeholder="User ID"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="w-full border rounded px-3 py-2 mb-3 text-sm"
              />
            )}
            <input
              placeholder="NIP"
              value={form.nip}
              onChange={(e) => setForm({ ...form, nip: e.target.value })}
              className="w-full border rounded px-3 py-2 mb-3 text-sm"
            />
            <input
              placeholder="Nama Lengkap"
              value={form.namaLengkap}
              onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
              className="w-full border rounded px-3 py-2 mb-3 text-sm"
            />
            <input
              placeholder="Mata Pelajaran"
              value={form.mapel}
              onChange={(e) => setForm({ ...form, mapel: e.target.value })}
              className="w-full border rounded px-3 py-2 mb-4 text-sm"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded text-sm">Batal</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabel */}
      {loading ? (
        <p className="text-gray-400">Memuat data...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">NIP</th>
                <th className="border p-3 text-left">Nama</th>
                <th className="border p-3 text-left">Mata Pelajaran</th>
                <th className="border p-3 text-left">Email</th>
                <th className="border p-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {gurus.length === 0 && (
                <tr><td colSpan={5} className="border p-3 text-center text-gray-400">Belum ada data guru</td></tr>
              )}
              {gurus.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="border p-3">{g.nip}</td>
                  <td className="border p-3">{g.namaLengkap}</td>
                  <td className="border p-3">{g.mapel}</td>
                  <td className="border p-3">{g.user?.email}</td>
                  <td className="border p-3">
                    <PermissionGuard permission="update:guru">
                      <button onClick={() => handleEdit(g)} className="text-blue-500 hover:underline mr-3">Edit</button>
                    </PermissionGuard>
                    <PermissionGuard permission="delete:guru">
                      <button onClick={() => handleDelete(g.id)} className="text-red-500 hover:underline">Hapus</button>
                    </PermissionGuard>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}