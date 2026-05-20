import { useState, useEffect } from 'react';
import axios from 'axios';

// Interface tipe data agar TypeScript ketat dan aman
interface Guru {
  id: string;
  nama: string;
}

interface Jadwal {
  id: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  mataPelajaran: string;
  ruangan: string;
  guruId: string;
  guru?: {
    nama: string;
  };
}

export default function JadwalPage() {
  const [jadwals, setJadwals] = useState<Jadwal[]>([]);
  const [gurus, setGurus] = useState<Guru[]>([]);
  
  // State form input
  const [hari, setHari] = useState('Senin');
  const [jamMulai, setJamMulai] = useState('');
  const [jamSelesai, setJamSelesai] = useState('');
  const [mataPelajaran, setMataPelajaran] = useState('');
  const [ruangan, setRuangan] = useState('');
  const [guruId, setGuruId] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');

  // State trigger untuk me-refresh data secara aman tanpa cascading render
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  // FIX: Isolasi fungsi fetching data di dalam useEffect agar terhindar dari cascading render warning
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [jadwalRes, guruRes] = await Promise.all([
          axios.get('/api/jadwal'),
          axios.get('/api/guru')
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
      } catch (error: unknown) {
        console.error("Gagal mengambil data jadwal/guru:", error);
        setJadwals([]);
        setGurus([]);
      }
    };

    fetchAllData();
  }, [refreshTrigger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { hari, jamMulai, jamSelesai, mataPelajaran, ruangan, guruId };
      
      if (isEditing) {
        await axios.put(`/api/jadwal/${currentId}`, payload);
        setIsEditing(false);
        setCurrentId('');
      } else {
        await axios.post('/api/jadwal', payload);
      }

      // Reset Form
      setJamMulai('');
      setJamSelesai('');
      setMataPelajaran('');
      setRuangan('');
      setGuruId('');
      triggerRefresh(); // Refresh data lewat trigger state
    } catch (error: unknown) { // FIX: Mengubah 'any' menjadi 'unknown'
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada sistem";
      alert(errorMessage);
    }
  };

  const handleEdit = (jadwal: Jadwal) => {
    setIsEditing(true);
    setCurrentId(jadwal.id);
    setHari(jadwal.hari);
    setJamMulai(jadwal.jamMulai);
    setJamSelesai(jadwal.jamSelesai);
    setMataPelajaran(jadwal.mataPelajaran);
    setRuangan(jadwal.ruangan);
    setGuruId(jadwal.guruId);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus jadwal pelajaran ini?")) {
      try {
        await axios.delete(`/api/jadwal/${id}`);
        triggerRefresh(); // Refresh data lewat trigger state
      } catch (error: unknown) {
        console.error("Gagal menghapus jadwal:", error);
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
          <input type="text" value={mataPelajaran} onChange={(e) => setMataPelajaran(e.target.value)} placeholder="Contoh: Matematika" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ruangan / Kelas</label>
          <input type="text" value={ruangan} onChange={(e) => setRuangan(e.target.value)} placeholder="Contoh: Lab Komputer 1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guru Pengajar</label>
          <select value={guruId} onChange={(e) => setGuruId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
            <option value="">-- Pilih Guru --</option>
            {Array.isArray(gurus) && gurus.map((g) => (
              <option key={g.id} value={g.id}>{g.nama}</option>
            ))}
          </select>
        </div>
        <button type="submit" className={`w-full font-medium py-2 px-4 rounded-lg text-white transition-colors md:col-span-3 ${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {isEditing ? 'Update Jadwal Pelajaran' : '+ Tambah Jadwal Pelajaran'}
        </button>
      </form>

      {/* Grid Menu Tampilan Jadwal Per Hari */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-600 text-sm">Waktu & Hari</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Mata Pelajaran</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Guru</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Ruangan</th>
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
                  <td className="p-4 text-sm font-medium text-gray-800">{j.mataPelajaran}</td>
                  <td className="p-4 text-sm text-gray-600">{j.guru?.nama || 'Guru Tidak Diketahui'}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{j.ruangan}</span>
                  </td>
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