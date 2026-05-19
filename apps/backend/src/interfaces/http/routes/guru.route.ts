import { Elysia } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const guruRoute = new Elysia({ prefix: '/guru' })
  .get('/', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:guru', set);
    return db.guru.findMany({ include: { user: true } });
  });
