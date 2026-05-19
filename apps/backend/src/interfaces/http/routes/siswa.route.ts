import { Elysia } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const siswaRoute = new Elysia({ prefix: '/siswa' })
  .get('/', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:siswa', set);
    return db.siswa.findMany({ include: { kelas: true, user: true } });
  });
