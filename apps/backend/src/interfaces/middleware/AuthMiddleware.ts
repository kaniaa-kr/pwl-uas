import * as jwt from 'jsonwebtoken';
import type { UserRoleWithPermissions } from '../../application/usecases/rbac-types';
import { db } from '../../infrastructure/database/prisma-client';

export async function verifyToken(token: string) {
  let decoded: jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
  } catch {
    throw new Error('Token tidak valid atau kadaluarsa');
  }

  const userId = decoded['userId'] as string;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      },
    },
  });

  if (!user) throw new Error('User tidak ditemukan');

  const roles = user.roles as UserRoleWithPermissions[];
  const roleNames = user.roles.map((ur) => ur.role.name);
  const permissions = [
    ...new Set(
      roles.flatMap((ur) =>
        ur.role.permissions.map((rp) => rp.permission.name)
      )
    ),
  ];

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    roles: roleNames,
    permissions,
  };
}