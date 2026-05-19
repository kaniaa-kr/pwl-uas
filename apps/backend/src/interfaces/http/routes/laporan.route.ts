import { Elysia } from 'elysia';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const laporanRoute = new Elysia({ prefix: '/laporan' })
  .get('/', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:laporan', set);
    return {
      message: 'Endpoint laporan siap digunakan',
    };
  });
