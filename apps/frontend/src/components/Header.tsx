import { useAuthStore } from '../stores/auth.store';
import { LogOut, User, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  
  // Format the path to a readable title
  const path = location.pathname.substring(1);
  const title = path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        
        <div className="h-6 w-px bg-gray-200"></div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden flex-col md:flex">
            <span className="text-sm font-medium text-gray-700">{user?.username || 'User'}</span>
            <span className="text-xs text-gray-500">{user?.roles?.[0] || 'Role'}</span>
          </div>
        </div>

        <button 
          onClick={logout}
          className="ml-2 rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
