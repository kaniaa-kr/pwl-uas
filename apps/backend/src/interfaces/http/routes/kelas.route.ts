import { Elysia, t } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const kelasRoute = new Elysia({ prefix: '/kelas' })
  // GET semua kelas
  .get('/', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:kelas', set);
    return db.kelas.findMany({
      include: {
        _count: { select: { siswas: true } }, // hitung jumlah siswa per kelas
      },
    });
  })
  // GET kelas berdasarkan ID (beserta daftar siswanya)
  .get('/:id', async ({ headers, params, set }) => {
    await RBACMiddleware(headers, 'read:kelas', set);
    return db.kelas.findUnique({
      where: { id: params.id },
      include: { siswas: true },
    });
  })
  // POST buat kelas baru (hanya SuperAdmin / Tata Usaha)
  .post('/', async ({ headers, body, set }) => {
    await RBACMiddleware(headers, 'create:kelas', set);
    return db.kelas.create({ data: body });
  }, {
    body: t.Object({
      nama: t.String(),
      tingkat: t.Number(),
    }),
  });