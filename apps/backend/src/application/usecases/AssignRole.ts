import { db } from '../../infrastructure/database/prisma-client';

export async function assignRole(userId: string, roleName: string) {
  const role = await db.role.findUnique({ where: { name: roleName } });
  if (!role) throw new Error(`Role '${roleName}' tidak ditemukan`);
  return db.userRole.upsert({
    where: { userId_roleId: { userId, roleId: role.id } },
    update: {},
    create: { userId, roleId: role.id },
  });
}