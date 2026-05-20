import { useState, useEffect } from 'react';
import axios from 'axios';

// Interface untuk tipe data Guru agar TypeScript ketat dan aman
interface Guru {
  id: string;
  nip: string;
  nama: string;
  kontak: string;
}

export default function GuruPage() {
  const [gurus, setGurus] = useState<Guru[]>([]);
  const [nip, setNip] = useState('');
  const [nama, setNama] = useState('');
  const [kontak, setKontak] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');

  // Fungsi pembantu untuk memicu render ulang setelah mutasi data (POST/PUT/DELETE)
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  // FIX: Ditambahkan pengecekan Array.isArray() untuk mencegah error ".map is not a function"
  useEffect(() => {
    const fetchGurus = async () => {
      try {
        const response = await axios.get('/api/guru');
        
        if (Array.isArray(response.data)) {
          // Jika backend mengembalikan raw array langsung: [...]
          setGurus(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          // Jika backend membungkus array di dalam object envelope: { data: [...] }
          setGurus(response.data.data);
        } else {
          console.error("Format data API tidak dikenali:", response.data);
          setGurus([]);
        }
      } catch (error: unknown) {
        console.error("Gagal mengambil data guru:", error);
        setGurus([]); // Reset ke array kosong jika request gagal
      }
    };

    fetchGurus();
  }, [refreshTrigger]); // Berjalan saat halaman pertama dimuat atau ketika data berubah

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/api/guru/${currentId}`, { nip, nama, kontak });
        setIsEditing(false);
        setCurrentId('');
      } else {
        await axios.post('/api/guru', { nip, nama, kontak });
      }
      
      // Reset Form
      setNip('');
      setNama('');
      setKontak('');
      triggerRefresh(); // Refresh data secara aman
    } catch (error: unknown) { 
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data";
      alert(errorMessage);
    }
  };

  const handleEdit = (guru: Guru) => {
    setIsEditing(true);
    setCurrentId(guru.id);
    setNip(guru.nip);
    setNama(guru.nama);
    setKontak(guru.kontak);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data guru ini?")) {
      try {
        await axios.delete(`/api/guru/${id}`);
        triggerRefresh(); // Refresh data secara aman
      } catch (error: unknown) {
        console.error("Gagal menghapus guru:", error);
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manajemen Data Guru</h1>
      
      {/* Form Input Data Guru */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
          <input type="text" value={nip} onChange={(e) => setNip(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
          <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kontak/No. HP</label>
          <input type="text" value={kontak} onChange={(e) => setKontak(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <button type="submit" className={`w-full font-medium py-2 px-4 rounded-lg text-white transition-colors ${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {isEditing ? 'Update Guru' : '+ Tambah Guru'}
        </button>
      </form>

      {/* Tabel Tampilan Data Guru */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-600 text-sm">NIP</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Nama</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Kontak</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* FIX: Mengamankan UI dengan validasi Array.isArray sebelum rendering */}
            {!Array.isArray(gurus) || gurus.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400 text-sm">Belum ada data guru.</td>
              </tr>
            ) : (
              gurus.map((guru) => (
                <tr key={guru.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-700">{guru.nip}</td>
                  <td className="p-4 text-sm text-gray-600">{guru.nama}</td>
                  <td className="p-4 text-sm text-gray-600">{guru.kontak}</td>
                  <td className="p-4 text-sm text-center space-x-2">
                    <button onClick={() => handleEdit(guru)} className="text-amber-600 hover:text-amber-700 font-medium px-2 py-1 rounded hover:bg-amber-50">Edit</button>
                    <button onClick={() => handleDelete(guru.id)} className="text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50">Hapus</button>
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