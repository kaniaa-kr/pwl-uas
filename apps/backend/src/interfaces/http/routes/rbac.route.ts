import { Elysia, t } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';
import { assignRole } from '../../../application/usecases/AssignRole';

export const rbacRoute = new Elysia({ prefix: '/rbac' })
  .get('/roles', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'manage:role', set);
    return db.role.findMany({ include: { permissions: { include: { permission: true } } } });
  })
  .post('/assign-role', async ({ headers, body, set }) => {
    await RBACMiddleware(headers, 'manage:role', set);
    return assignRole(body.userId, body.roleName);
  }, {
    body: t.Object({ userId: t.String(), roleName: t.String() }),
  })
  .get('/permissions', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'manage:permission', set);
    return db.permission.findMany();
  });