import { Elysia, t } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const siswaRoute = new Elysia({ prefix: '/siswa' })
  .get('/', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:siswa', set);
    return db.siswa.findMany({
      include: {
        kelas: true,
        user: { select: { email: true, username: true } },
      },
    });
  })
  
  .get('/:id', async ({ headers, params, set }) => {
    await RBACMiddleware(headers, 'read:siswa', set);
    const siswa = await db.siswa.findUnique({
      where: { id: params.id },
      include: {
        kelas: true,
        nilais: { include: { guru: true } },
        absensis: { orderBy: { tanggal: 'desc' } },
        user: { select: { email: true, username: true } },
      },
    });
    if (!siswa) {
      set.status = 404;
      return { message: 'Siswa tidak ditemukan' };
    }
    return siswa;
  })
 
  .post('/', async ({ headers, body, set }) => {
    await RBACMiddleware(headers, 'create:siswa', set);
    const { userId, nis, namaLengkap, kelasId } = body;


    const existing = await db.siswa.findUnique({ where: { nis } });
    if (existing) {
      set.status = 400;
      return { message: 'NIS sudah digunakan' };
    }

    return db.siswa.create({
      data: { userId, nis, namaLengkap, kelasId },
      include: { kelas: true },
    });
  }, {
    body: t.Object({
      userId: t.String(),
      nis: t.String(),
      namaLengkap: t.String(),
      kelasId: t.String(),
    }),
  })

  .put('/:id', async ({ headers, params, body, set }) => {
    await RBACMiddleware(headers, 'update:siswa', set);
    return db.siswa.update({
      where: { id: params.id },
      data: body,
      include: { kelas: true },
    });
  }, {
    body: t.Object({
      namaLengkap: t.Optional(t.String()),
      kelasId: t.Optional(t.String()),
    }),
  })

  .delete('/:id', async ({ headers, params, set }) => {
    await RBACMiddleware(headers, 'delete:siswa', set);
    await db.siswa.delete({ where: { id: params.id } });
    return { message: 'Data siswa berhasil dihapus' };
  });