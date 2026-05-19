import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  // Buat Permissions
  const permissionNames = [
    'create:user', 'read:user', 'update:user', 'delete:user',
    'create:siswa', 'read:siswa', 'update:siswa', 'delete:siswa',
    'create:guru', 'read:guru', 'update:guru', 'delete:guru',
    'create:kelas', 'read:kelas', 'update:kelas', 'delete:kelas',
    'create:jadwal', 'read:jadwal', 'update:jadwal', 'delete:jadwal',
    'create:nilai', 'read:nilai', 'update:nilai', 'delete:nilai',
    'create:absensi', 'read:absensi', 'update:absensi',
    'read:laporan', 'export:laporan',
    'manage:role', 'manage:permission',
  ];

  const permissions = await Promise.all(
    permissionNames.map((name) =>
      db.permission.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const permMap = Object.fromEntries(permissions.map((p) => [p.name, p.id]));

  // Buat Roles
  const roleData = [
    { name: 'SUPERADMIN', perms: permissionNames },
    {
      name: 'KEPALA_SEKOLAH',
      perms: ['read:user','read:siswa','read:guru','read:kelas','read:jadwal','read:nilai','read:absensi','read:laporan','export:laporan'],
    },
    {
      name: 'TATA_USAHA',
      perms: ['create:siswa','read:siswa','update:siswa','create:absensi','read:absensi','update:absensi','read:kelas'],
    },
    {
      name: 'GURU',
      perms: ['create:nilai','read:nilai','update:nilai','create:absensi','read:absensi','update:absensi','read:siswa','read:jadwal'],
    },
    {
      name: 'SISWA',
      perms: ['read:nilai','read:jadwal','read:absensi'],
    },
    {
      name: 'WALI_MURID',
      perms: ['read:nilai','read:absensi','read:jadwal'],
    },
    {
      name: 'OPERATOR',
      perms: ['create:jadwal','read:jadwal','update:jadwal','delete:jadwal','read:guru','update:guru'],
    },
  ];

  for (const rd of roleData) {
    const role = await db.role.upsert({
      where: { name: rd.name }, update: {}, create: { name: rd.name },
    });
    await db.rolePermission.deleteMany({ where: { roleId: role.id } });
    await db.rolePermission.createMany({
      data: rd.perms.map((p) => ({ roleId: role.id, permissionId: permMap[p] })),
    });
  }

  // Buat User SuperAdmin
  const hash = await bcrypt.hash('admin123', 10);
  const adminUser = await db.user.upsert({
    where: { email: 'admin@eduaccess.id' },
    update: {},
    create: { username: 'superadmin', email: 'admin@eduaccess.id', password: hash },
  });
  const superAdminRole = await db.role.findUnique({ where: { name: 'SUPERADMIN' } });
  await db.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: superAdminRole!.id } },
    update: {},
    create: { userId: adminUser.id, roleId: superAdminRole!.id },
  });

  // Seed Kelas
  const kelasList = ['X-A','X-B','XI-IPA-1','XI-IPS-1','XII-IPA-1'];
  const tingkatMap: Record<string, number> = { X: 10, XI: 11, XII: 12 };
  const kelasRecords = await Promise.all(
    kelasList.map((nama) =>
      db.kelas.upsert({
        where: { nama },
        update: {},
        create: { nama, tingkat: tingkatMap[nama.split('-')[0]] },
      })
    )
  );

  console.log('✅ Seed selesai');
  console.log('👤 Login SuperAdmin: admin@eduaccess.id / admin123');
}

main().catch(console.error).finally(() => db.$disconnect());