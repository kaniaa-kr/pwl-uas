import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { PermissionGuard } from '../components/PermissionGuard';

const API = import.meta.env.VITE_API_URL;

export default function NilaiPage() {
  const { token } = useAuthStore();
  const [nilais, setNilais] = useState([]);

  useEffect(() => {
    axios.get(`${API}/nilai`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (Array.isArray(r.data)) {
          setNilais(r.data);
        } else if (r.data && Array.isArray(r.data.data)) {
          setNilais(r.data.data);
        } else {
          setNilais([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setNilais([]);
      });
  }, [token]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Nilai Siswa</h1>
        <PermissionGuard permission="create:nilai">
          <button className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700">
            + Input Nilai Baru
          </button>
        </PermissionGuard>
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-left text-sm font-semibold text-gray-700">
              <th className="p-3">Nama Siswa</th>
              <th className="p-3">Mata Pelajaran</th>
              <th className="p-3">Nilai</th>
              <th className="p-3">Semester</th>
              <PermissionGuard permission="update:nilai">
                <th className="p-3">Aksi</th>
              </PermissionGuard>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600">
            {Array.isArray(nilais) && nilais.map((n: any) => (
              <tr key={n.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{n.siswa?.namaLengkap}</td>
                <td className="p-3">{n.mapel}</td>
                <td className="p-3 font-bold text-blue-600">{n.nilai}</td>
                <td className="p-3">{n.semester}</td>
                <PermissionGuard permission="update:nilai">
                  <td className="p-3">
                    <button className="text-blue-500 hover:underline">Edit</button>
                  </td>
                </PermissionGuard>
              </tr>
            ))}
            {(!Array.isArray(nilais) || nilais.length === 0) && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-400">Belum ada data nilai.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}