import { Elysia } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const laporanRoute = new Elysia({ prefix: '/laporan' })

  // Endpoint 1: Statistik jumlah total
  .get('/statistik', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:laporan', set);

    const [totalSiswa, totalGuru, totalKelas] = await Promise.all([
      db.siswa.count(),
      db.guru.count(),
      db.kelas.count(),
    ]);

    return { totalSiswa, totalGuru, totalKelas };
  })

  // Endpoint 2: Rata-rata nilai seluruh siswa
  .get('/nilai-rata-rata', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:laporan', set);

    const nilais = await db.nilai.findMany();
    const avg =
      nilais.reduce((sum: number, n: { nilai: number }) => sum + n.nilai, 0) / (nilais.length || 1);

    return {
      rataRataNilai: parseFloat(avg.toFixed(2)),
      totalData: nilais.length,
    };
  })

  // Endpoint 3: Rekap absensi per status
  .get('/absensi-rekap', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:laporan', set);

    const rekap = await db.absensi.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return rekap;
  });