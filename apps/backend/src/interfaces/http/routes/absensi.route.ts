import { Elysia } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const absensiRoute = new Elysia({ prefix: '/absensi' })
  .get('/', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:absensi', set);
    return db.absensi.findMany({ include: { siswa: true } });
  });
