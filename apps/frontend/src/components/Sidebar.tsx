import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

const navItems = [
  { to: '/',        label: '🏠 Dashboard',        permission: null },
  { to: '/siswa',   label: '👨‍🎓 Data Siswa',       permission: 'read:siswa' },
  { to: '/guru',    label: '👨‍🏫 Data Guru',         permission: 'read:guru' },
  { to: '/jadwal',  label: '📅 Jadwal',            permission: 'read:jadwal' },
  { to: '/nilai',   label: '📝 Nilai',             permission: 'read:nilai' },
  { to: '/absensi', label: '✅ Absensi',           permission: 'read:absensi' },
  { to: '/laporan', label: '📊 Laporan',           permission: 'read:laporan' },
  { to: '/users',   label: '⚙️ User Management',  permission: 'manage:role' },
];

export default function Sidebar() {
  const { logout, hasPermission } = useAuthStore();

  return (
    <aside className="min-h-screen w-60 border-r bg-white p-4 text-left">
      <h1 className="mb-6 text-xl font-semibold">🏫 EduAccess</h1>
      <nav className="flex flex-col gap-1">
        {navItems
          // Filter: tampilkan hanya menu yang permission-nya dimiliki user
          .filter((item) => !item.permission || hasPermission(item.permission))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
      </nav>
      <button
        className="mt-8 rounded-md border px-3 py-2 text-sm w-full text-left hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
        onClick={logout}
      >
        🚪 Logout
      </button>
    </aside>
  );
}