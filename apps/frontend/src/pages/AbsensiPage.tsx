import { useState } from 'react';
import { PermissionGuard } from '../components/PermissionGuard';

export default function AbsensiPage() {
  const [status, setStatus] = useState('HADIR');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manajemen Absensi</h1>
        <p className="text-gray-500 text-sm">Pencatatan dan rekapitulasi kehadiran siswa.</p>
      </div>

      <PermissionGuard permission="create:absensi" fallback={
        <div className="p-4 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded text-sm">
          Menu pengisian absensi hanya terbuka untuk peran Guru dan Tata Usaha. Jika Anda siswa, silakan hubungi wali kelas untuk rekap absensi.
        </div>
      }>
        <div className="max-w-md bg-white border rounded shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Form Input Absensi</h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID/NIS Siswa</label>
              <input type="text" className="w-full border rounded p-2 text-sm focus:outline-blue-500" placeholder="Masukkan ID Siswa" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Kehadiran</label>
              <select value={status} onChange={(e) => setStatus((e.target as HTMLSelectElement).value)} className="w-full border rounded p-2 text-sm focus:outline-blue-500">
                <option value="HADIR">HADIR</option>
                <option value="IZIN">IZIN</option>
                <option value="SAKIT">SAKIT</option>
                <option value="ALPHA">ALPHA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (Opsional)</label>
              <textarea className="w-full border rounded p-2 text-sm focus:outline-blue-500" placeholder="Contoh: Sakit demam, keperluan keluarga"></textarea>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded text-sm font-semibold hover:bg-blue-700">
              Simpan Absensi
            </button>
          </form>
        </div>
      </PermissionGuard>
    </div>
  );
}