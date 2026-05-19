import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SiswaPage from './pages/SiswaPage';
import GuruPage from './pages/GuruPage';
import JadwalPage from './pages/JadwalPage';
import NilaiPage from './pages/NilaiPage';
import AbsensiPage from './pages/AbsensiPage';
import LaporanPage from './pages/LaporanPage';
import Sidebar from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './stores/auth.store';

export default function App() {
  const { token } = useAuthStore();

  return (
    <BrowserRouter>
      {token && <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-gray-50 min-h-screen">
          <Routes>
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/siswa" element={<ProtectedRoute requiredPermission="read:siswa"><SiswaPage /></ProtectedRoute>} />
            <Route path="/guru" element={<ProtectedRoute requiredPermission="read:guru"><GuruPage /></ProtectedRoute>} />
            <Route path="/jadwal" element={<ProtectedRoute requiredPermission="read:jadwal"><JadwalPage /></ProtectedRoute>} />
            <Route path="/nilai" element={<ProtectedRoute requiredPermission="read:nilai"><NilaiPage /></ProtectedRoute>} />
            <Route path="/absensi" element={<ProtectedRoute requiredPermission="read:absensi"><AbsensiPage /></ProtectedRoute>} />
            <Route path="/laporan" element={<ProtectedRoute requiredPermission="read:laporan"><LaporanPage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>}
      {!token && <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>}
    </BrowserRouter>
  );
}