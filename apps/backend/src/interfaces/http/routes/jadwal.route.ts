import { Elysia, t } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const jadwalRoute = new Elysia({ prefix: '/jadwal' })
  .get('/', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:jadwal', set);
    return db.jadwal.findMany({
      include: { guru: true, kelas: true },
      orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }],
    });
  })
  .get('/kelas/:kelasId', async ({ headers, params, set }) => {
    await RBACMiddleware(headers, 'read:jadwal', set);
    return db.jadwal.findMany({
      where: { kelasId: params.kelasId },
      include: { guru: true, kelas: true },
      orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }],
    });
  })
  .get('/guru/:guruId', async ({ headers, params, set }) => {
    await RBACMiddleware(headers, 'read:jadwal', set);
    return db.jadwal.findMany({
      where: { guruId: params.guruId },
      include: { kelas: true },
      orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }],
    });
  })
  .post('/', async ({ headers, body, set }) => {
    await RBACMiddleware(headers, 'create:jadwal', set);
    return db.jadwal.create({ data: body });
  }, {
    body: t.Object({
      guruId: t.String(),
      kelasId: t.String(),
      mapel: t.String(),
      hari: t.Union([
        t.Literal('Senin'), t.Literal('Selasa'), t.Literal('Rabu'),
        t.Literal('Kamis'), t.Literal('Jumat'), t.Literal('Sabtu'),
      ]),
      jamMulai: t.String(),
      jamSelesai: t.String(),
    }),
  })
  .put('/:id', async ({ headers, params, body, set }) => {
    await RBACMiddleware(headers, 'update:jadwal', set);
    return db.jadwal.update({ where: { id: params.id }, data: body });
  }, {
    body: t.Object({
      guruId: t.Optional(t.String()),
      kelasId: t.Optional(t.String()),
      mapel: t.Optional(t.String()),
      hari: t.Optional(t.String()),
      jamMulai: t.Optional(t.String()),
      jamSelesai: t.Optional(t.String()),
    }),
  })
  .delete('/:id', async ({ headers, params, set }) => {
    await RBACMiddleware(headers, 'delete:jadwal', set);
    await db.jadwal.delete({ where: { id: params.id } });
    return { message: 'Jadwal berhasil dihapus' };
  });