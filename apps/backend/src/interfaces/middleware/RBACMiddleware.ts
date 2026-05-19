import * as jwt from 'jsonwebtoken';
import type { UserRoleWithPermissions } from '../../application/usecases/rbac-types';
import { db } from '../../infrastructure/database/prisma-client';

export async function RBACMiddleware(
  headers: Record<string, string | undefined>,
  requiredPermission: string,
  set: any
) {
  const authHeader = headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    set.status = 401;
    throw new Error('Token tidak ditemukan');
  }

  const token = authHeader.slice('Bearer '.length);
  let decoded: jwt.JwtPayload | string;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    set.status = 401;
    throw new Error('Token tidak valid atau kadaluarsa');
  }

  if (typeof decoded === 'string' || typeof decoded.userId !== 'string') {
    set.status = 401;
    throw new Error('Payload token tidak valid');
  }

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
    include: {
      roles: {
        include: {
          role: {
            include: { permissions: { include: { permission: true } } },
          },
        },
      },
    },
  });

  if (!user) { set.status = 401; throw new Error('User tidak ditemukan'); }

  const roles = user.roles as UserRoleWithPermissions[];
  const userPermissions = roles.flatMap((ur) =>
    ur.role.permissions.map((rp) => rp.permission.name)
  );

  if (!userPermissions.includes(requiredPermission)) {
    set.status = 403;
    throw new Error(`Akses ditolak. Permission '${requiredPermission}' diperlukan.`);
  }
}
