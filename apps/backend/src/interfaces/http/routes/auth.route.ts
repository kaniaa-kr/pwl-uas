import * as bcrypt from 'bcryptjs';
import { Elysia, t } from 'elysia';
import * as jwt from 'jsonwebtoken';
import type { UserRoleWithPermissions } from '../../../application/usecases/rbac-types';
import { db } from '../../../infrastructure/database/prisma-client';

export const authRoute = new Elysia({ prefix: '/auth' })
  .post('/register', async ({ body, set }) => {
    const password = await bcrypt.hash(body.password, 10);
    const user = await db.user.create({
      data: {
        username: body.username,
        email: body.email,
        password,
      },
      select: { id: true, username: true, email: true },
    });

    set.status = 201;
    return user;
  }, {
    body: t.Object({
      username: t.String(),
      email: t.String(),
      password: t.String(),
    }),
  })
  .post('/login', async ({ body, set }) => {
    const user = await db.user.findUnique({
      where: { email: body.email },
      include: {
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      set.status = 401;
      throw new Error('Email atau password salah');
    }

    const roles = user.roles as UserRoleWithPermissions[];
    const permissions = roles.flatMap((userRole) =>
      userRole.role.permissions.map((rolePermission) => rolePermission.permission.name)
    );

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    return {
      token,
      user: { id: user.id, username: user.username, email: user.email },
      permissions,
    };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  });
