import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SiswaPage from './pages/SiswaPage';
import GuruPage from './pages/GuruPage';
import JadwalPage from './pages/JadwalPage';
import NilaiPage from './pages/NilaiPage';
import AbsensiPage from './pages/AbsensiPage';
import LaporanPage from './pages/LaporanPage';
import UserManagementPage from './pages/UserManagementPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './stores/auth.store';

export default function App() {
  const { token } = useAuthStore();

  return (
    <BrowserRouter>
      {token ? (
        <div className="flex min-h-screen bg-gray-50/50">
          <Sidebar />
          <div className="flex-1 md:pl-64 flex flex-col transition-all duration-300 min-w-0">
            <Header />
            <main className="flex-1 p-6 md:p-8">
              <div className="mx-auto max-w-7xl">
                <Routes>
                  <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/siswa" element={<ProtectedRoute requiredPermission="read:siswa"><SiswaPage /></ProtectedRoute>} />
                  <Route path="/guru" element={<ProtectedRoute requiredPermission="read:guru"><GuruPage /></ProtectedRoute>} />
                  <Route path="/jadwal" element={<ProtectedRoute requiredPermission="read:jadwal"><JadwalPage /></ProtectedRoute>} />
                  <Route path="/nilai" element={<ProtectedRoute requiredPermission="read:nilai"><NilaiPage /></ProtectedRoute>} />
                  <Route path="/absensi" element={<ProtectedRoute requiredPermission="read:absensi"><AbsensiPage /></ProtectedRoute>} />
                  <Route path="/laporan" element={<ProtectedRoute requiredPermission="read:laporan"><LaporanPage /></ProtectedRoute>} />
                  <Route path="/users" element={<ProtectedRoute requiredPermission="manage:role"><UserManagementPage /></ProtectedRoute>} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}