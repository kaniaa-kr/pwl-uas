import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API = import.meta.env.VITE_API_URL;

interface Guru {
  id: string;
  namaLengkap: string;
}

interface Jadwal {
  id: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  mapel: string;
  guruId: string;
  kelasId: string;
  guru?: {
    namaLengkap: string;
  };
  kelas?: {
    nama: string;
  };
}

export default function JadwalPage() {
  const { token } = useAuthStore();
  const [jadwals, setJadwals] = useState<Jadwal[]>([]);
  const [gurus, setGurus] = useState<Guru[]>([]);

  const [hari, setHari] = useState('Senin');
  const [jamMulai, setJamMulai] = useState('');
  const [jamSelesai, setJamSelesai] = useState('');
  const [mapel, setMapel] = useState('');
  const [guruId, setGuruId] = useState('');
  const [kelasId, setKelasId] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const headers = { Authorization: `Bearer ${token}` };
  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [jadwalRes, guruRes] = await Promise.all([
          axios.get(`${API}/jadwal`, { headers }),
          axios.get(`${API}/guru`, { headers }),
        ]);

        if (Array.isArray(jadwalRes.data)) {
          setJadwals(jadwalRes.data);
        } else if (jadwalRes.data && Array.isArray(jadwalRes.data.data)) {
          setJadwals(jadwalRes.data.data);
        } else {
          setJadwals([]);
        }

        if (Array.isArray(guruRes.data)) {
          setGurus(guruRes.data);
        } else if (guruRes.data && Array.isArray(guruRes.data.data)) {
          setGurus(guruRes.data.data);
        } else {
          setGurus([]);
        }
      } catch (error) {
        console.error('Gagal mengambil data jadwal/guru:', error);
        setJadwals([]);
        setGurus([]);
      }
    };

    fetchAllData();
  }, [refreshTrigger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { hari, jamMulai, jamSelesai, mapel, guruId, kelasId };

      if (isEditing) {
        await axios.put(`${API}/jadwal/${currentId}`, { hari, jamMulai, jamSelesai }, { headers });
        setIsEditing(false);
        setCurrentId('');
      } else {
        await axios.post(`${API}/jadwal`, payload, { headers });
      }

      setJamMulai('');
      setJamSelesai('');
      setMapel('');
      setGuruId('');
      setKelasId('');
      triggerRefresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada sistem';
      alert(errorMessage);
    }
  };

  const handleEdit = (jadwal: Jadwal) => {
    setIsEditing(true);
    setCurrentId(jadwal.id);
    setHari(jadwal.hari);
    setJamMulai(jadwal.jamMulai);
    setJamSelesai(jadwal.jamSelesai);
    setMapel(jadwal.mapel);
    setGuruId(jadwal.guruId);
    setKelasId(jadwal.kelasId);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal pelajaran ini?')) {
      try {
        await axios.delete(`${API}/jadwal/${id}`, { headers });
        triggerRefresh();
      } catch (error) {
        console.error('Gagal menghapus jadwal:', error);
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manajemen Jadwal Pelajaran</h1>

      {/* Form Input Jadwal */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hari</label>
          <select value={hari} onChange={(e) => setHari(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="Senin">Senin</option>
            <option value="Selasa">Selasa</option>
            <option value="Rabu">Rabu</option>
            <option value="Kamis">Kamis</option>
            <option value="Jumat">Jumat</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
          <input type="time" value={jamMulai} onChange={(e) => setJamMulai(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
          <input type="time" value={jamSelesai} onChange={(e) => setJamSelesai(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
          <input type="text" value={mapel} onChange={(e) => setMapel(e.target.value)} placeholder="Contoh: Matematika" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guru Pengajar</label>
          <select value={guruId} onChange={(e) => setGuruId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
            <option value="">-- Pilih Guru --</option>
            {Array.isArray(gurus) && gurus.map((g) => (
              <option key={g.id} value={g.id}>{g.namaLengkap}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
          <input type="text" value={kelasId} onChange={(e) => setKelasId(e.target.value)} placeholder="ID Kelas" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <button type="submit" className={`w-full font-medium py-2 px-4 rounded-lg text-white transition-colors md:col-span-3 ${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {isEditing ? 'Update Jadwal Pelajaran' : '+ Tambah Jadwal Pelajaran'}
        </button>
      </form>

      {/* Tabel Jadwal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-600 text-sm">Waktu & Hari</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Mata Pelajaran</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Guru</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Kelas</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!Array.isArray(jadwals) || jadwals.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">Belum ada jadwal pelajaran yang diatur.</td>
              </tr>
            ) : (
              jadwals.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-700">
                    <span className="block font-semibold text-indigo-600">{j.hari}</span>
                    <span className="text-xs text-gray-500">{j.jamMulai} - {j.jamSelesai}</span>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-800">{j.mapel}</td>
                  <td className="p-4 text-sm text-gray-600">{j.guru?.namaLengkap || 'Guru Tidak Diketahui'}</td>
                  <td className="p-4 text-sm text-gray-600">{j.kelas?.nama || '-'}</td>
                  <td className="p-4 text-sm text-center space-x-2">
                    <button onClick={() => handleEdit(j)} className="text-amber-600 hover:text-amber-700 font-medium px-2 py-1 rounded hover:bg-amber-50">Edit</button>
                    <button onClick={() => handleDelete(j.id)} className="text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}