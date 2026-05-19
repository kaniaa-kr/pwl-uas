import { Elysia } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const nilaiRoute = new Elysia({ prefix: '/nilai' })
  .get('/', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:nilai', set);
    return db.nilai.findMany({ include: { siswa: true, guru: true } });
  });
