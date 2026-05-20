import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CalendarDays, 
  BookOpenCheck, 
  ClipboardCheck, 
  FileBarChart,
  Settings
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/siswa', label: 'Siswa', icon: Users },
  { to: '/guru', label: 'Guru', icon: GraduationCap },
  { to: '/jadwal', label: 'Jadwal', icon: CalendarDays },
  { to: '/nilai', label: 'Nilai', icon: BookOpenCheck },
  { to: '/absensi', label: 'Absensi', icon: ClipboardCheck },
  { to: '/laporan', label: 'Laporan', icon: FileBarChart },
  { to: '/users', label: 'User Management', icon: Settings },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  
  const visibleNavItems = navItems.filter(item => {
    if (item.to === '/users' && !user?.permissions?.includes('manage:role')) return false;
    return true;
  });

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 flex-col border-r bg-white/95 backdrop-blur shadow-sm hidden md:flex">
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-sm">
          EA
        </div>
        <h1 className="ml-3 text-xl font-bold tracking-tight text-gray-900">EduAccess</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="flex flex-col gap-1.5">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}