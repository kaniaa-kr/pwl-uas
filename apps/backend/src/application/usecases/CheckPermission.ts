import { db } from '../../infrastructure/database/prisma-client';
import type { UserRoleWithPermissions } from './rbac-types';

export async function checkPermission(userId: string, permission: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      },
    },
  });
  if (!user) return false;
  const roles = user.roles as UserRoleWithPermissions[];
  const perms = roles.flatMap((ur) =>
    ur.role.permissions.map((rp) => rp.permission.name)
  );
  return perms.includes(permission);
}
