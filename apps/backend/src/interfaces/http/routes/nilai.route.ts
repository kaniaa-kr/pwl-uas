import { Elysia, t } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const nilaiRoute = new Elysia({ prefix: '/nilai' })
  .get('/', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:nilai', set);
    return db.nilai.findMany({ include: { siswa: true, guru: true } });
  })
  .get('/siswa/:siswaId', async ({ headers, params, set }) => {
    await RBACMiddleware(headers, 'read:nilai', set);
    return db.nilai.findMany({ where: { siswaId: params.siswaId }, include: { guru: true } });
  })
  .post('/', async ({ headers, body, set }) => {
    await RBACMiddleware(headers, 'create:nilai', set);
    return db.nilai.create({ data: body });
  }, {
    body: t.Object({
      siswaId: t.String(),
      guruId: t.String(),
      mapel: t.String(),
      nilai: t.Number(),
      semester: t.Number(),
      tahunAjar: t.String(),
    }),
  })
  .put('/:id', async ({ headers, params, body, set }) => {
    await RBACMiddleware(headers, 'update:nilai', set);
    return db.nilai.update({ where: { id: params.id }, data: body });
  }, {
    body: t.Object({ nilai: t.Optional(t.Number()) }),
  });