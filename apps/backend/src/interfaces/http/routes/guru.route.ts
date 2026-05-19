import { Elysia, t } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const guruRoute = new Elysia({ prefix: '/guru' })
  .get('/', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:guru', set);
    return db.guru.findMany({
      include: { user: { select: { email: true, username: true } } },
    });
  })
  .get('/:id', async ({ headers, params, set }) => {
    await RBACMiddleware(headers, 'read:guru', set);
    const guru = await db.guru.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { email: true, username: true } },
        jadwals: { include: { kelas: true } },
      },
    });
    if (!guru) { set.status = 404; return { message: 'Guru tidak ditemukan' }; }
    return guru;
  })
  .post('/', async ({ headers, body, set }) => {
    await RBACMiddleware(headers, 'create:guru', set);
    return db.guru.create({ data: body });
  }, {
    body: t.Object({
      userId: t.String(),
      nip: t.String(),
      namaLengkap: t.String(),
      mapel: t.String(),
    }),
  })
  .put('/:id', async ({ headers, params, body, set }) => {
    await RBACMiddleware(headers, 'update:guru', set);
    return db.guru.update({ where: { id: params.id }, data: body });
  }, {
    body: t.Object({
      namaLengkap: t.Optional(t.String()),
      mapel: t.Optional(t.String()),
      nip: t.Optional(t.String()),
    }),
  })
  .delete('/:id', async ({ headers, params, set }) => {
    await RBACMiddleware(headers, 'delete:guru', set);
    await db.guru.delete({ where: { id: params.id } });
    return { message: 'Data guru berhasil dihapus' };
  });