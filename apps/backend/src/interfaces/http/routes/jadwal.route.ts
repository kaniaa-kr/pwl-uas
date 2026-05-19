import { Elysia } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const jadwalRoute = new Elysia({ prefix: '/jadwal' })
  .get('/', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:jadwal', set);
    return db.jadwal.findMany({ include: { guru: true, kelas: true } });
  });
