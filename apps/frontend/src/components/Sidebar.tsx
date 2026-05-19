import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/siswa', label: 'Siswa' },
  { to: '/guru', label: 'Guru' },
  { to: '/jadwal', label: 'Jadwal' },
  { to: '/nilai', label: 'Nilai' },
  { to: '/absensi', label: 'Absensi' },
  { to: '/laporan', label: 'Laporan' },
];

export default function Sidebar() {
  const { logout } = useAuthStore();

  return (
    <aside className="min-h-screen w-60 border-r bg-white p-4 text-left">
      <h1 className="mb-6 text-xl font-semibold">EduAccess</h1>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button className="mt-8 rounded-md border px-3 py-2 text-sm" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
