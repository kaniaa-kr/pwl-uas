import { Elysia, t } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const absensiRoute = new Elysia({ prefix: '/absensi' })
  .get('/siswa/:siswaId', async ({ headers, params, set }) => {
    await RBACMiddleware(headers, 'read:absensi', set);
    return db.absensi.findMany({ where: { siswaId: params.siswaId }, orderBy: { tanggal: 'desc' } });
  })
  .post('/', async ({ headers, body, set }) => {
    await RBACMiddleware(headers, 'create:absensi', set);
    return db.absensi.create({ data: { ...body, tanggal: new Date(body.tanggal) } });
  }, {
    body: t.Object({
      siswaId: t.String(),
      tanggal: t.String(),
      status: t.Union([t.Literal('HADIR'), t.Literal('IZIN'), t.Literal('SAKIT'), t.Literal('ALPHA')]),
      keterangan: t.Optional(t.String()),
    }),
  });