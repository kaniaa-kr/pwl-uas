import { db } from '../../infrastructure/database/prisma-client';

interface CreateSiswaInput {
  userId: string;
  nis: string;
  namaLengkap: string;
  kelasId: string;
}

export async function createSiswa(input: CreateSiswaInput) {
  const existing = await db.siswa.findUnique({ where: { nis: input.nis } });
  if (existing) throw new Error('NIS sudah digunakan');

  return db.siswa.create({
    data: input,
    include: { kelas: true },
  });
}