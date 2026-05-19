import { useAuthStore } from '../stores/auth.store';
import type { ReactNode } from 'react';

interface Props {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({ permission, fallback = null, children }: Props) {
  const { hasPermission } = useAuthStore();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}
