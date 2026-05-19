import * as bcrypt from 'bcryptjs';
import { Elysia, t } from 'elysia';
import * as jwt from 'jsonwebtoken';
import type { UserRoleWithPermissions } from '../../../application/usecases/rbac-types';
import { db } from '../../../infrastructure/database/prisma-client';

export const authRoute = new Elysia({ prefix: '/auth' })
  .post('/register', async ({ body, set }) => {
    const { username, email, password, roleName } = body;

    const exists = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (exists) {
      set.status = 400;
      return { message: 'Email atau username sudah digunakan' };
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { username, email, password: hash },
    });

    const role = await db.role.findUnique({
      where: { name: roleName ?? 'SISWA' },
    });
    if (role) {
      await db.userRole.create({
        data: { userId: user.id, roleId: role.id },
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return {
      message: 'Register berhasil',
      token,
      userId: user.id,
    };
  }, {
    body: t.Object({
      username: t.String(),
      email: t.String(),
      password: t.String(),
      roleName: t.Optional(t.String()),
    }),
  })

  .post('/login', async ({ body, set }) => {
    const user = await db.user.findUnique({
      where: { email: body.email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      set.status = 401;
      return { message: 'Email atau password salah' };
    }

    const roles = user.roles as UserRoleWithPermissions[];

    const roleNames = user.roles.map((ur) => ur.role.name);
    const permissions = [
      ...new Set(
        roles.flatMap((ur) =>
          ur.role.permissions.map((rp) => rp.permission.name)
        )
      ),
    ];

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return {
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: roleNames,
        permissions,
      },
    };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  })

  .get('/me', async ({ headers, set }) => {
    const authHeader = headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      set.status = 401;
      return { message: 'Token tidak ditemukan' };
    }

    const token = authHeader.slice('Bearer '.length);
    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    } catch {
      set.status = 401;
      return { message: 'Token tidak valid' };
    }

    const user = await db.user.findUnique({
      where: { id: decoded['userId'] as string },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (!user) {
      set.status = 404;
      return { message: 'User tidak ditemukan' };
    }

    const roles = user.roles as UserRoleWithPermissions[];
    const roleNames = user.roles.map((ur) => ur.role.name);
    const permissions = [
      ...new Set(
        roles.flatMap((ur) =>
          ur.role.permissions.map((rp) => rp.permission.name)
        )
      ),
    ];

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: roleNames,
      permissions,
    };
  });