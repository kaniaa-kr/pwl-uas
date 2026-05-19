import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  requiredPermission?: string;
}

export function ProtectedRoute({ children, requiredPermission }: Props) {
  const { token, hasPermission } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (requiredPermission && !hasPermission(requiredPermission))
    return <div className="p-6 text-red-500">Akses ditolak. Kamu tidak punya permission untuk halaman ini.</div>;
  return <>{children}</>;
}
