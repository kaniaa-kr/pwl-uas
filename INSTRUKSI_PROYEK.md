# 🏫 EduAccess — Sistem Manajemen Sekolah dengan RBAC

> **Mata Kuliah:** Pemrograman Web Lanjut
> **Tipe Proyek:** Monorepo (Bun + TypeScript)
> **Stack:** React · ElysiaJS · Prisma v6 · MySQL · Clean Architecture
> **Tim:** 7 Orang
> **Tema:** Sistem Manajemen Sekolah dengan Full RBAC (Role-Based Access Control)

---

## 📑 Daftar Isi

1. [Ide & Konsep Sistem](#1-ide--konsep-sistem)
2. [Struktur Tim & Pembagian Tugas](#2-struktur-tim--pembagian-tugas)
3. [Role RBAC yang Diimplementasi](#3-role-rbac-yang-diimplementasi)
4. [Struktur Folder Proyek](#4-struktur-folder-proyek)
5. [Alur Kerja Git](#5-alur-kerja-git)
6. [Setup Awal — Anggota1 (DevOps)](#6-setup-awal--anggota1-devops)
7. [Panduan Anggota2 — Auth & User Management](#7-panduan-anggota2--auth--user-management)
8. [Panduan Anggota3 — Data Siswa & Kelas](#8-panduan-anggota3--data-siswa--kelas)
9. [Panduan Anggota4 — Manajemen Guru & Jadwal](#9-panduan-anggota4--manajemen-guru--jadwal)
10. [Panduan Anggota5 — Nilai & Absensi](#10-panduan-anggota5--nilai--absensi)
11. [Panduan Anggota6 — Dashboard & Laporan](#11-panduan-anggota6--dashboard--laporan)
12. [Panduan Anggota7 — RBAC Middleware & Permission Guard](#12-panduan-anggota7--rbac-middleware--permission-guard)
13. [Environment Variables](#13-environment-variables)
14. [Testing Lokal](#14-testing-lokal)
15. [Checklist Pengumpulan](#15-checklist-pengumpulan)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. Ide & Konsep Sistem

**EduAccess** adalah sistem manajemen sekolah berbasis web yang mengimplementasikan RBAC secara penuh. Setiap pengguna memiliki role berbeda dengan izin akses (permission) yang berbeda pula.

### Masalah yang Diselesaikan

Di banyak sekolah, semua staff menggunakan satu akun admin bersama sehingga tidak ada audit trail dan tidak ada pemisahan akses. EduAccess menyelesaikan ini dengan:

- Setiap pengguna punya akun sendiri dengan role spesifik
- Fitur hanya muncul sesuai permission role yang dimiliki
- Semua aksi tercatat dengan `createdAt` / `updatedAt` untuk audit

### Fitur Utama per Role

| Role | Bisa Melakukan |
|------|----------------|
| **SuperAdmin** | Kelola semua user, role, permission; akses semua fitur |
| **Kepala Sekolah** | Lihat semua laporan, setujui data, tidak bisa hapus user |
| **Tata Usaha** | Kelola data siswa, kelas, absensi |
| **Guru** | Input nilai & absensi kelas yang diajarnya saja |
| **Siswa** | Lihat nilai, jadwal, dan absensi diri sendiri |
| **Wali Murid** | Lihat nilai & absensi anak yang terdaftar |
| **Operator** | Kelola jadwal pelajaran & data guru |

---

## 2. Struktur Tim & Pembagian Tugas

| Anggota | Role | Branch | Tanggung Jawab |
|---------|------|--------|----------------|
| **Anggota1** | DevOps + Database | `feat/setup-devops` | Monorepo, Prisma schema RBAC, seed data, ERD |
| **Anggota2** | Backend + Frontend Auth | `feat/auth` | Login/logout, JWT, halaman login, register, user profile |
| **Anggota3** | Backend + Frontend Siswa | `feat/siswa` | CRUD data siswa, kelas, endpoint + halaman |
| **Anggota4** | Backend + Frontend Guru | `feat/guru` | CRUD data guru, jadwal pelajaran, endpoint + halaman |
| **Anggota5** | Backend + Frontend Nilai | `feat/nilai` | Input nilai, absensi, endpoint + halaman |
| **Anggota6** | Backend + Frontend Dashboard | `feat/dashboard` | Dashboard per-role, laporan, statistik |
| **Anggota7** | RBAC Middleware + Permission Guard | `feat/rbac` | Middleware backend, ProtectedRoute frontend, permission checks |

---

## 3. Role RBAC yang Diimplementasi

Sistem menggunakan 5 tabel sesuai modul: `User`, `Role`, `Permission`, `UserRole`, `RolePermission`.

### Daftar Permission

```
# User Management
create:user       read:user        update:user       delete:user

# Siswa
create:siswa      read:siswa       update:siswa      delete:siswa

# Guru
create:guru       read:guru        update:guru       delete:guru

# Kelas & Jadwal
create:kelas      read:kelas       update:kelas      delete:kelas
create:jadwal     read:jadwal      update:jadwal     delete:jadwal

# Nilai & Absensi
create:nilai      read:nilai       update:nilai      delete:nilai
create:absensi    read:absensi     update:absensi

# Laporan
read:laporan      export:laporan

# RBAC Management
manage:role       manage:permission
```

### Mapping Role → Permission

| Role | Permission |
|------|-----------|
| **SuperAdmin** | Semua permission |
| **Kepala Sekolah** | `read:*`, `read:laporan`, `export:laporan` |
| **Tata Usaha** | `create/read/update:siswa`, `create/read/update:absensi`, `read:kelas` |
| **Guru** | `create/read/update:nilai`, `create/read/update:absensi`, `read:siswa`, `read:jadwal` |
| **Siswa** | `read:nilai` (milik sendiri), `read:jadwal`, `read:absensi` (milik sendiri) |
| **Wali Murid** | `read:nilai` (anak), `read:absensi` (anak), `read:jadwal` |
| **Operator** | `create/read/update/delete:jadwal`, `read/update:guru` |

---

## 4. Struktur Folder Proyek

```
eduaccess/
├── apps/
│   ├── frontend/                        # Vite + React + Tailwind + ShadCN
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx              (Anggota2)
│   │   │   │   ├── DashboardPage.tsx          (Anggota6)
│   │   │   │   ├── SiswaPage.tsx              (Anggota3)
│   │   │   │   ├── GuruPage.tsx               (Anggota4)
│   │   │   │   ├── NilaiPage.tsx              (Anggota5)
│   │   │   │   ├── AbsensiPage.tsx            (Anggota5)
│   │   │   │   ├── JadwalPage.tsx             (Anggota4)
│   │   │   │   ├── LaporanPage.tsx            (Anggota6)
│   │   │   │   └── UserManagementPage.tsx     (Anggota2)
│   │   │   ├── components/
│   │   │   │   ├── Navbar.tsx                 (Anggota6)
│   │   │   │   ├── Sidebar.tsx                (Anggota6)
│   │   │   │   ├── ProtectedRoute.tsx         (Anggota7)
│   │   │   │   ├── PermissionGuard.tsx        (Anggota7)
│   │   │   │   └── RoleBadge.tsx              (Anggota7)
│   │   │   ├── stores/
│   │   │   │   └── auth.store.ts              (Anggota2)
│   │   │   ├── lib/
│   │   │   │   └── permissions.ts             (Anggota7)
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── .env.local
│   │   └── package.json
│   │
│   └── backend/                          # ElysiaJS + Prisma v6 + Clean Architecture
│       ├── src/
│       │   ├── domain/
│       │   │   ├── entities/
│       │   │   │   ├── User.ts
│       │   │   │   ├── Role.ts
│       │   │   │   ├── Siswa.ts
│       │   │   │   ├── Guru.ts
│       │   │   │   └── Nilai.ts
│       │   │   └── repositories/
│       │   │       ├── IUserRepository.ts
│       │   │       ├── ISiswaRepository.ts
│       │   │       ├── IGuruRepository.ts
│       │   │       └── INilaiRepository.ts
│       │   ├── application/
│       │   │   ├── usecases/
│       │   │   │   ├── CheckPermission.ts     (Anggota7)
│       │   │   │   ├── AssignRole.ts          (Anggota7)
│       │   │   │   ├── LoginUser.ts           (Anggota2)
│       │   │   │   ├── CreateSiswa.ts         (Anggota3)
│       │   │   │   ├── CreateNilai.ts         (Anggota5)
│       │   │   │   └── GetLaporan.ts          (Anggota6)
│       │   │   └── services/
│       │   │       └── RBACService.ts         (Anggota7)
│       │   ├── infrastructure/
│       │   │   ├── database/
│       │   │   │   └── prisma-client.ts       (Anggota1)
│       │   │   └── repositories/
│       │   │       ├── PrismaUserRepository.ts
│       │   │       ├── PrismaSiswaRepository.ts
│       │   │       ├── PrismaGuruRepository.ts
│       │   │       └── PrismaNilaiRepository.ts
│       │   ├── interfaces/
│       │   │   ├── http/
│       │   │   │   ├── routes/
│       │   │   │   │   ├── auth.route.ts      (Anggota2)
│       │   │   │   │   ├── siswa.route.ts     (Anggota3)
│       │   │   │   │   ├── guru.route.ts      (Anggota4)
│       │   │   │   │   ├── nilai.route.ts     (Anggota5)
│       │   │   │   │   ├── absensi.route.ts   (Anggota5)
│       │   │   │   │   ├── jadwal.route.ts    (Anggota4)
│       │   │   │   │   ├── laporan.route.ts   (Anggota6)
│       │   │   │   │   └── rbac.route.ts      (Anggota7)
│       │   │   │   └── index.ts
│       │   │   └── middleware/
│       │   │       ├── RBACMiddleware.ts      (Anggota7)
│       │   │       └── AuthMiddleware.ts      (Anggota2)
│       │   └── config/
│       │       └── env.ts
│       ├── prisma/
│       │   ├── schema.prisma              (Anggota1)
│       │   └── seed.ts                    (Anggota1)
│       ├── .env
│       └── package.json
│
├── docs/
│   └── ERD.md                             (Anggota1)
├── package.json
└── .gitignore
```

---

## 5. Alur Kerja Git

### 5.1 — Setup Pertama Kali

```bash
git clone https://github.com/<repo>/eduaccess.git
cd eduaccess
git checkout main
git pull origin main

# Buat branch sesuai peran:
git checkout -b feat/setup-devops   # Anggota1
git checkout -b feat/auth           # Anggota2
git checkout -b feat/siswa          # Anggota3
git checkout -b feat/guru           # Anggota4
git checkout -b feat/nilai          # Anggota5
git checkout -b feat/dashboard      # Anggota6
git checkout -b feat/rbac           # Anggota7
```

### 5.2 — Rutinitas Harian

```bash
git checkout feat/<branch-kamu>
git fetch origin
git merge origin/main

# ... coding ...

git add .
git commit -m "feat(siswa): tambah endpoint GET /siswa dan halaman SiswaPage"
git push origin feat/<branch-kamu>
```

### 5.3 — Format Commit

```
feat(scope): deskripsi singkat

Contoh:
✅ feat(auth): endpoint login + JWT
✅ feat(siswa): CRUD siswa dan halaman SiswaPage
✅ feat(rbac): RBACMiddleware + CheckPermission usecase
✅ fix(nilai): perbaiki query prisma di getNilaiByKelas
✅ style(dashboard): fix layout sidebar mobile
```

### 5.4 — Pull Request

1. Push branch → buka GitHub → **New pull request**
2. Base: `main` ← Compare: `feat/<branch-kamu>`
3. Judul: `feat(scope): ringkasan fitur`
4. Isi deskripsi dengan **Yang Dikerjakan** + **Cara Test**
5. Request review dari 1 anggota → merge setelah di-approve

### 5.5 — Aturan Branch

```
main
  ├── feat/setup-devops   (Anggota1)
  ├── feat/auth           (Anggota2)
  ├── feat/siswa          (Anggota3)
  ├── feat/guru           (Anggota4)
  ├── feat/nilai          (Anggota5)
  ├── feat/dashboard      (Anggota6)
  └── feat/rbac           (Anggota7)
```

> ⚠️ **JANGAN** commit langsung ke `main`. Semua harus via PR.

---

## 6. Setup Awal — Anggota1 (DevOps)

> **Kerjakan ini DULUAN sebelum anggota lain mulai.** Push ke `main` setelah selesai.

### 6.1 — Install Bun & MySQL

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
bun --version

# Buat database
mysql -u root -p
CREATE DATABASE eduaccess_db;
EXIT;
```

### 6.2 — Inisialisasi Monorepo

```bash
mkdir eduaccess && cd eduaccess
git init

cat > package.json << 'EOF'
{
  "name": "eduaccess",
  "version": "1.0.0",
  "workspaces": ["apps/*"],
  "scripts": {
    "dev:be": "bun --cwd apps/backend dev",
    "dev:fe": "bun --cwd apps/frontend dev",
    "dev": "concurrently \"bun dev:be\" \"bun dev:fe\""
  }
}
EOF

cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
dist/
.DS_Store
*.log
EOF

mkdir -p apps docs
```

### 6.3 — Setup Backend

```bash
cd apps
mkdir backend && cd backend
bun init -y

# Dependencies
bun add elysia @elysiajs/cors @elysiajs/jwt @elysiajs/bearer
bun add @prisma/client@^6.0.0
bun add bcryptjs jsonwebtoken dotenv
bun add -d prisma@^6.0.0 @types/bcryptjs @types/jsonwebtoken

# Init Prisma
bunx prisma init --datasource-provider mysql
```

### 6.4 — Prisma Schema (Full RBAC + Domain Sekolah)

Tulis di `apps/backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ===== RBAC CORE (5 Tabel Wajib dari Modul) =====

model User {
  id        String   @id @default(uuid())
  username  String   @unique
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  roles     UserRole[]
  guru      Guru?
  siswa     Siswa?
}

model Role {
  id          String           @id @default(uuid())
  name        String           @unique
  description String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  users       UserRole[]
  permissions RolePermission[]
}

model Permission {
  id          String           @id @default(uuid())
  name        String           @unique
  description String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  roles       RolePermission[]
}

model UserRole {
  userId    String
  roleId    String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  @@id([userId, roleId])
}

model RolePermission {
  roleId       String
  permissionId String
  createdAt    DateTime   @default(now())
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@id([roleId, permissionId])
}

// ===== DOMAIN SEKOLAH =====

model Guru {
  id         String    @id @default(uuid())
  userId     String    @unique
  nip        String    @unique
  namaLengkap String
  mapel      String
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  jadwals    Jadwal[]
  nilais     Nilai[]
}

model Kelas {
  id        String    @id @default(uuid())
  nama      String    @unique   // contoh: "X-A", "XI-IPA-1"
  tingkat   Int                 // 10, 11, 12
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  siswas    Siswa[]
  jadwals   Jadwal[]
}

model Siswa {
  id          String     @id @default(uuid())
  userId      String     @unique
  nis         String     @unique
  namaLengkap String
  kelasId     String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  kelas       Kelas      @relation(fields: [kelasId], references: [id])
  nilais      Nilai[]
  absensis    Absensi[]
}

model Jadwal {
  id        String   @id @default(uuid())
  guruId    String
  kelasId   String
  mapel     String
  hari      String   // "Senin", "Selasa", dst
  jamMulai  String   // "08:00"
  jamSelesai String  // "09:30"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  guru      Guru     @relation(fields: [guruId], references: [id])
  kelas     Kelas    @relation(fields: [kelasId], references: [id])
}

model Nilai {
  id        String   @id @default(uuid())
  siswaId   String
  guruId    String
  mapel     String
  nilai     Float
  semester  Int      // 1 atau 2
  tahunAjar String   // "2024/2025"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  siswa     Siswa    @relation(fields: [siswaId], references: [id], onDelete: Cascade)
  guru      Guru     @relation(fields: [guruId], references: [id])
}

model Absensi {
  id        String   @id @default(uuid())
  siswaId   String
  tanggal   DateTime
  status    String   // "HADIR", "IZIN", "SAKIT", "ALPHA"
  keterangan String?
  createdAt DateTime @default(now())
  siswa     Siswa    @relation(fields: [siswaId], references: [id], onDelete: Cascade)
}
```

### 6.5 — Migrasi Database

```bash
# Di apps/backend/
bunx prisma migrate dev --name init_eduaccess
```

### 6.6 — Seed Data (`prisma/seed.ts`)

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  // Buat Permissions
  const permissionNames = [
    'create:user', 'read:user', 'update:user', 'delete:user',
    'create:siswa', 'read:siswa', 'update:siswa', 'delete:siswa',
    'create:guru', 'read:guru', 'update:guru', 'delete:guru',
    'create:kelas', 'read:kelas', 'update:kelas', 'delete:kelas',
    'create:jadwal', 'read:jadwal', 'update:jadwal', 'delete:jadwal',
    'create:nilai', 'read:nilai', 'update:nilai', 'delete:nilai',
    'create:absensi', 'read:absensi', 'update:absensi',
    'read:laporan', 'export:laporan',
    'manage:role', 'manage:permission',
  ];

  const permissions = await Promise.all(
    permissionNames.map((name) =>
      db.permission.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const permMap = Object.fromEntries(permissions.map((p) => [p.name, p.id]));

  // Buat Roles
  const roleData = [
    { name: 'SUPERADMIN', perms: permissionNames },
    {
      name: 'KEPALA_SEKOLAH',
      perms: ['read:user','read:siswa','read:guru','read:kelas','read:jadwal','read:nilai','read:absensi','read:laporan','export:laporan'],
    },
    {
      name: 'TATA_USAHA',
      perms: ['create:siswa','read:siswa','update:siswa','create:absensi','read:absensi','update:absensi','read:kelas'],
    },
    {
      name: 'GURU',
      perms: ['create:nilai','read:nilai','update:nilai','create:absensi','read:absensi','update:absensi','read:siswa','read:jadwal'],
    },
    {
      name: 'SISWA',
      perms: ['read:nilai','read:jadwal','read:absensi'],
    },
    {
      name: 'WALI_MURID',
      perms: ['read:nilai','read:absensi','read:jadwal'],
    },
    {
      name: 'OPERATOR',
      perms: ['create:jadwal','read:jadwal','update:jadwal','delete:jadwal','read:guru','update:guru'],
    },
  ];

  for (const rd of roleData) {
    const role = await db.role.upsert({
      where: { name: rd.name }, update: {}, create: { name: rd.name },
    });
    await db.rolePermission.deleteMany({ where: { roleId: role.id } });
    await db.rolePermission.createMany({
      data: rd.perms.map((p) => ({ roleId: role.id, permissionId: permMap[p] })),
    });
  }

  // Buat User SuperAdmin
  const hash = await bcrypt.hash('admin123', 10);
  const adminUser = await db.user.upsert({
    where: { email: 'admin@eduaccess.id' },
    update: {},
    create: { username: 'superadmin', email: 'admin@eduaccess.id', password: hash },
  });
  const superAdminRole = await db.role.findUnique({ where: { name: 'SUPERADMIN' } });
  await db.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: superAdminRole!.id } },
    update: {},
    create: { userId: adminUser.id, roleId: superAdminRole!.id },
  });

  // Seed Kelas
  const kelasList = ['X-A','X-B','XI-IPA-1','XI-IPS-1','XII-IPA-1'];
  const tingkatMap: Record<string, number> = { X: 10, XI: 11, XII: 12 };
  const kelasRecords = await Promise.all(
    kelasList.map((nama) =>
      db.kelas.upsert({
        where: { nama },
        update: {},
        create: { nama, tingkat: tingkatMap[nama.split('-')[0]] },
      })
    )
  );

  console.log('✅ Seed selesai');
  console.log('👤 Login SuperAdmin: admin@eduaccess.id / admin123');
}

main().catch(console.error).finally(() => db.$disconnect());
```

Tambahkan script seed ke `package.json`:

```json
"scripts": {
  "dev": "bun run --watch src/interfaces/http/index.ts",
  "db:seed": "bun prisma/seed.ts",
  "db:studio": "bunx prisma studio"
}
```

Jalankan seed:

```bash
bun run db:seed
```

### 6.7 — Prisma Client Singleton

Buat `src/infrastructure/database/prisma-client.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

### 6.8 — Entry Point Backend

Buat `src/interfaces/http/index.ts`:

```typescript
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { authRoute } from './routes/auth.route';
import { siswaRoute } from './routes/siswa.route';
import { guruRoute } from './routes/guru.route';
import { nilaiRoute } from './routes/nilai.route';
import { absensiRoute } from './routes/absensi.route';
import { jadwalRoute } from './routes/jadwal.route';
import { laporanRoute } from './routes/laporan.route';
import { rbacRoute } from './routes/rbac.route';

const app = new Elysia()
  .use(cors({ origin: '*' }))
  .use(authRoute)
  .use(siswaRoute)
  .use(guruRoute)
  .use(nilaiRoute)
  .use(absensiRoute)
  .use(jadwalRoute)
  .use(laporanRoute)
  .use(rbacRoute)
  .get('/', () => ({ status: 'EduAccess API berjalan ✅' }))
  .listen(process.env.PORT || 3000);

console.log(`🦊 Backend berjalan di http://localhost:${app.server?.port}`);
```

### 6.9 — Setup Frontend (Anggota1 inisialisasi saja)

```bash
cd apps
bun create vite frontend --template react-ts
cd frontend
bun install
bun add tailwindcss @tailwindcss/vite
bun add @shadcn/ui zustand axios react-router-dom
bunx shadcn@latest init
```

---

## 7. Panduan Anggota2 — Auth & User Management

### 7.1 — AuthMiddleware

Buat `src/interfaces/middleware/AuthMiddleware.ts`:

```typescript
import { db } from '../../infrastructure/database/prisma-client';
import jwt from 'jsonwebtoken';

export async function verifyToken(token: string) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  const user = await db.user.findUnique({
    where: { id: decoded.userId },
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
  if (!user) throw new Error('User tidak ditemukan');
  return user;
}
```

### 7.2 — Auth Route

Buat `src/interfaces/http/routes/auth.route.ts`:

```typescript
import { Elysia, t } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const authRoute = new Elysia({ prefix: '/auth' })
  .post('/register', async ({ body, set }) => {
    const { username, email, password, roleName } = body;
    const exists = await db.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (exists) { set.status = 400; return { message: 'Email/username sudah digunakan' }; }

    const hash = await bcrypt.hash(password, 10);
    const user = await db.user.create({ data: { username, email, password: hash } });

    const role = await db.role.findUnique({ where: { name: roleName || 'SISWA' } });
    if (role) await db.userRole.create({ data: { userId: user.id, roleId: role.id } });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    return { message: 'Register berhasil', token, userId: user.id };
  }, {
    body: t.Object({
      username: t.String(),
      email: t.String(),
      password: t.String(),
      roleName: t.Optional(t.String()),
    }),
  })
  .post('/login', async ({ body, set }) => {
    const { email, password } = body;
    const user = await db.user.findUnique({
      where: { email },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      set.status = 401;
      return { message: 'Email atau password salah' };
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    const roles = user.roles.map((ur) => ur.role.name);
    const permissions = [...new Set(
      user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.name))
    )];

    return { message: 'Login berhasil', token, user: { id: user.id, username: user.username, email: user.email, roles, permissions } };
  }, {
    body: t.Object({ email: t.String(), password: t.String() }),
  });
```

### 7.3 — Zustand Auth Store (`apps/frontend/src/stores/auth.store.ts`)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: { id: string; username: string; email: string; roles: string[]; permissions: string[] } | null;
  login: (token: string, user: AuthState['user']) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      hasPermission: (permission) => get().user?.permissions.includes(permission) ?? false,
      hasRole: (role) => get().user?.roles.includes(role) ?? false,
    }),
    { name: 'eduaccess-auth' }
  )
);
```

### 7.4 — Commit & Push

```bash
git add .
git commit -m "feat(auth): endpoint login/register + JWT + zustand auth store"
git push origin feat/auth
```

---

## 8. Panduan Anggota3 — Data Siswa & Kelas

### 8.1 — Siswa Route

Buat `src/interfaces/http/routes/siswa.route.ts`:

```typescript
import { Elysia, t } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const siswaRoute = new Elysia({ prefix: '/siswa' })
  .get('/', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:siswa', set);
    return db.siswa.findMany({ include: { kelas: true, user: { select: { email: true } } } });
  })
  .get('/:id', async ({ headers, params, set }) => {
    await RBACMiddleware(headers, 'read:siswa', set);
    return db.siswa.findUnique({ where: { id: params.id }, include: { kelas: true, nilais: true, absensis: true } });
  })
  .post('/', async ({ headers, body, set }) => {
    await RBACMiddleware(headers, 'create:siswa', set);
    const { userId, nis, namaLengkap, kelasId } = body;
    return db.siswa.create({ data: { userId, nis, namaLengkap, kelasId } });
  }, {
    body: t.Object({ userId: t.String(), nis: t.String(), namaLengkap: t.String(), kelasId: t.String() }),
  })
  .put('/:id', async ({ headers, params, body, set }) => {
    await RBACMiddleware(headers, 'update:siswa', set);
    return db.siswa.update({ where: { id: params.id }, data: body });
  }, {
    body: t.Object({ namaLengkap: t.Optional(t.String()), kelasId: t.Optional(t.String()) }),
  })
  .delete('/:id', async ({ headers, params, set }) => {
    await RBACMiddleware(headers, 'delete:siswa', set);
    await db.siswa.delete({ where: { id: params.id } });
    return { message: 'Siswa dihapus' };
  });
```

### 8.2 — Halaman SiswaPage

Buat `apps/frontend/src/pages/SiswaPage.tsx`:

```tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { PermissionGuard } from '../components/PermissionGuard';

const API = import.meta.env.VITE_API_URL;

export default function SiswaPage() {
  const { token } = useAuthStore();
  const [siswas, setSiswas] = useState([]);

  useEffect(() => {
    axios.get(`${API}/siswa`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setSiswas(r.data));
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Data Siswa</h1>
        <PermissionGuard permission="create:siswa">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">+ Tambah Siswa</button>
        </PermissionGuard>
      </div>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">NIS</th>
            <th className="border p-2 text-left">Nama</th>
            <th className="border p-2 text-left">Kelas</th>
            <PermissionGuard permission="update:siswa">
              <th className="border p-2 text-left">Aksi</th>
            </PermissionGuard>
          </tr>
        </thead>
        <tbody>
          {siswas.map((s: any) => (
            <tr key={s.id}>
              <td className="border p-2">{s.nis}</td>
              <td className="border p-2">{s.namaLengkap}</td>
              <td className="border p-2">{s.kelas?.nama}</td>
              <PermissionGuard permission="update:siswa">
                <td className="border p-2">
                  <button className="text-blue-500 mr-2">Edit</button>
                  <PermissionGuard permission="delete:siswa">
                    <button className="text-red-500">Hapus</button>
                  </PermissionGuard>
                </td>
              </PermissionGuard>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 8.3 — Commit & Push

```bash
git add .
git commit -m "feat(siswa): endpoint CRUD siswa + kelas + halaman SiswaPage"
git push origin feat/siswa
```

---

## 9. Panduan Anggota4 — Manajemen Guru & Jadwal

### 9.1 — Guru Route

Buat `src/interfaces/http/routes/guru.route.ts`:

```typescript
import { Elysia, t } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const guruRoute = new Elysia({ prefix: '/guru' })
  .get('/', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:guru', set);
    return db.guru.findMany({ include: { user: { select: { email: true } } } });
  })
  .post('/', async ({ headers, body, set }) => {
    await RBACMiddleware(headers, 'create:guru', set);
    return db.guru.create({ data: body });
  }, {
    body: t.Object({ userId: t.String(), nip: t.String(), namaLengkap: t.String(), mapel: t.String() }),
  })
  .put('/:id', async ({ headers, params, body, set }) => {
    await RBACMiddleware(headers, 'update:guru', set);
    return db.guru.update({ where: { id: params.id }, data: body });
  }, {
    body: t.Object({ namaLengkap: t.Optional(t.String()), mapel: t.Optional(t.String()) }),
  });
```

### 9.2 — Jadwal Route

Buat `src/interfaces/http/routes/jadwal.route.ts`:

```typescript
import { Elysia, t } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const jadwalRoute = new Elysia({ prefix: '/jadwal' })
  .get('/', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:jadwal', set);
    return db.jadwal.findMany({ include: { guru: true, kelas: true } });
  })
  .post('/', async ({ headers, body, set }) => {
    await RBACMiddleware(headers, 'create:jadwal', set);
    return db.jadwal.create({ data: body });
  }, {
    body: t.Object({
      guruId: t.String(), kelasId: t.String(), mapel: t.String(),
      hari: t.String(), jamMulai: t.String(), jamSelesai: t.String(),
    }),
  })
  .put('/:id', async ({ headers, params, body, set }) => {
    await RBACMiddleware(headers, 'update:jadwal', set);
    return db.jadwal.update({ where: { id: params.id }, data: body });
  }, {
    body: t.Object({
      hari: t.Optional(t.String()), jamMulai: t.Optional(t.String()),
      jamSelesai: t.Optional(t.String()),
    }),
  })
  .delete('/:id', async ({ headers, params, set }) => {
    await RBACMiddleware(headers, 'delete:jadwal', set);
    await db.jadwal.delete({ where: { id: params.id } });
    return { message: 'Jadwal dihapus' };
  });
```

### 9.3 — Commit & Push

```bash
git add .
git commit -m "feat(guru): endpoint CRUD guru + jadwal pelajaran + halaman GuruPage dan JadwalPage"
git push origin feat/guru
```

---

## 10. Panduan Anggota5 — Nilai & Absensi

### 10.1 — Nilai Route

Buat `src/interfaces/http/routes/nilai.route.ts`:

```typescript
import { Elysia, t } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const nilaiRoute = new Elysia({ prefix: '/nilai' })
  .get('/', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:nilai', set);
    return db.nilai.findMany({ include: { siswa: true, guru: true } });
  })
  .get('/siswa/:siswaId', async ({ headers, params, set }) => {
    await RBACMiddleware(headers, 'read:nilai', set);
    return db.nilai.findMany({ where: { siswaId: params.siswaId }, include: { guru: true } });
  })
  .post('/', async ({ headers, body, set }) => {
    await RBACMiddleware(headers, 'create:nilai', set);
    return db.nilai.create({ data: body });
  }, {
    body: t.Object({
      siswaId: t.String(), guruId: t.String(), mapel: t.String(),
      nilai: t.Number(), semester: t.Number(), tahunAjar: t.String(),
    }),
  })
  .put('/:id', async ({ headers, params, body, set }) => {
    await RBACMiddleware(headers, 'update:nilai', set);
    return db.nilai.update({ where: { id: params.id }, data: body });
  }, {
    body: t.Object({ nilai: t.Optional(t.Number()) }),
  });
```

### 10.2 — Absensi Route

Buat `src/interfaces/http/routes/absensi.route.ts`:

```typescript
import { Elysia, t } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const absensiRoute = new Elysia({ prefix: '/absensi' })
  .get('/siswa/:siswaId', async ({ headers, params, set }) => {
    await RBACMiddleware(headers, 'read:absensi', set);
    return db.absensi.findMany({ where: { siswaId: params.siswaId }, orderBy: { tanggal: 'desc' } });
  })
  .post('/', async ({ headers, body, set }) => {
    await RBACMiddleware(headers, 'create:absensi', set);
    return db.absensi.create({ data: { ...body, tanggal: new Date(body.tanggal) } });
  }, {
    body: t.Object({
      siswaId: t.String(), tanggal: t.String(),
      status: t.Union([t.Literal('HADIR'), t.Literal('IZIN'), t.Literal('SAKIT'), t.Literal('ALPHA')]),
      keterangan: t.Optional(t.String()),
    }),
  });
```

### 10.3 — Commit & Push

```bash
git add .
git commit -m "feat(nilai): endpoint nilai + absensi + halaman NilaiPage dan AbsensiPage"
git push origin feat/nilai
```

---

## 11. Panduan Anggota6 — Dashboard & Laporan

### 11.1 — Laporan Route

Buat `src/interfaces/http/routes/laporan.route.ts`:

```typescript
import { Elysia } from 'elysia';
import { db } from '../../../infrastructure/database/prisma-client';
import { RBACMiddleware } from '../../middleware/RBACMiddleware';

export const laporanRoute = new Elysia({ prefix: '/laporan' })
  .get('/statistik', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:laporan', set);
    const [totalSiswa, totalGuru, totalKelas] = await Promise.all([
      db.siswa.count(),
      db.guru.count(),
      db.kelas.count(),
    ]);
    return { totalSiswa, totalGuru, totalKelas };
  })
  .get('/nilai-rata-rata', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:laporan', set);
    const nilais = await db.nilai.findMany();
    const avg = nilais.reduce((sum, n) => sum + n.nilai, 0) / (nilais.length || 1);
    return { rataRataNilai: avg.toFixed(2), totalData: nilais.length };
  })
  .get('/absensi-rekap', async ({ headers, set }) => {
    await RBACMiddleware(headers, 'read:laporan', set);
    const rekap = await db.absensi.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    return rekap;
  });
```

### 11.2 — DashboardPage

Buat `apps/frontend/src/pages/DashboardPage.tsx`:

```tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API = import.meta.env.VITE_API_URL;

export default function DashboardPage() {
  const { token, user, hasPermission } = useAuthStore();
  const [statistik, setStatistik] = useState<any>(null);

  useEffect(() => {
    if (hasPermission('read:laporan')) {
      axios.get(`${API}/laporan/statistik`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => setStatistik(r.data));
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-6">Selamat datang, <strong>{user?.username}</strong> ({user?.roles.join(', ')})</p>

      {statistik && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{statistik.totalSiswa}</p>
            <p className="text-sm text-gray-500">Total Siswa</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{statistik.totalGuru}</p>
            <p className="text-sm text-gray-500">Total Guru</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{statistik.totalKelas}</p>
            <p className="text-sm text-gray-500">Total Kelas</p>
          </div>
        </div>
      )}

      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">Role & Permission Kamu</h2>
        <p className="text-sm text-gray-500">Role: {user?.roles.join(', ')}</p>
        <p className="text-sm text-gray-400 mt-1">Permissions: {user?.permissions.join(', ')}</p>
      </div>
    </div>
  );
}
```

### 11.3 — Sidebar dengan Permission-Based Navigation

Buat `apps/frontend/src/components/Sidebar.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

const navItems = [
  { to: '/', label: '🏠 Dashboard', permission: null },
  { to: '/siswa', label: '👨‍🎓 Data Siswa', permission: 'read:siswa' },
  { to: '/guru', label: '👨‍🏫 Data Guru', permission: 'read:guru' },
  { to: '/jadwal', label: '📅 Jadwal', permission: 'read:jadwal' },
  { to: '/nilai', label: '📝 Nilai', permission: 'read:nilai' },
  { to: '/absensi', label: '✅ Absensi', permission: 'read:absensi' },
  { to: '/laporan', label: '📊 Laporan', permission: 'read:laporan' },
  { to: '/users', label: '⚙️ User Management', permission: 'manage:role' },
];

export default function Sidebar() {
  const { hasPermission } = useAuthStore();

  return (
    <aside className="w-56 bg-gray-900 text-white min-h-screen p-4">
      <h2 className="text-lg font-bold mb-6">🏫 EduAccess</h2>
      <nav className="space-y-1">
        {navItems
          .filter((item) => !item.permission || hasPermission(item.permission))
          .map((item) => (
            <Link key={item.to} to={item.to}
              className="block px-3 py-2 rounded hover:bg-gray-700 text-sm">
              {item.label}
            </Link>
          ))}
      </nav>
    </aside>
  );
}
```

### 11.4 — Commit & Push

```bash
git add .
git commit -m "feat(dashboard): laporan statistik + DashboardPage + Sidebar permission-based"
git push origin feat/dashboard
```

---

## 12. Panduan Anggota7 — RBAC Middleware & Permission Guard

> Ini adalah bagian paling krusial. Anggota lain bergantung pada file-file ini.

### 12.1 — RBACMiddleware (Backend)

Buat `src/interfaces/middleware/RBACMiddleware.ts`:

```typescript
import jwt from 'jsonwebtoken';
import { db } from '../../infrastructure/database/prisma-client';

export async function RBACMiddleware(
  headers: Record<string, string | undefined>,
  requiredPermission: string,
  set: any
) {
  const authHeader = headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    set.status = 401;
    throw new Error('Token tidak ditemukan');
  }

  const token = authHeader.split(' ')[1];
  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    set.status = 401;
    throw new Error('Token tidak valid atau kadaluarsa');
  }

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
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

  if (!user) { set.status = 401; throw new Error('User tidak ditemukan'); }

  const userPermissions = user.roles.flatMap((ur) =>
    ur.role.permissions.map((rp) => rp.permission.name)
  );

  if (!userPermissions.includes(requiredPermission)) {
    set.status = 403;
    throw new Error(`Akses ditolak. Permission '${requiredPermission}' diperlukan.`);
  }
}
```

### 12.2 — CheckPermission Usecase

Buat `src/application/usecases/CheckPermission.ts`:

```typescript
import { db } from '../../infrastructure/database/prisma-client';

export async function checkPermission(userId: string, permission: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      },
    },
  });
  if (!user) return false;
  const perms = user.roles.flatMap((ur) =>
    ur.role.permissions.map((rp) => rp.permission.name)
  );
  return perms.includes(permission);
}
```

### 12.3 — AssignRole Usecase

Buat `src/application/usecases/AssignRole.ts`:

```typescript
import { db } from '../../infrastructure/database/prisma-client';

export async function assignRole(userId: string, roleName: string) {
  const role = await db.role.findUnique({ where: { name: roleName } });
  if (!role) throw new Error(`Role '${roleName}' tidak ditemukan`);
  return db.userRole.upsert({
    where: { userId_roleId: { userId, roleId: role.id } },
    update: {},
    create: { userId, roleId: role.id },
  });
}
```

### 12.4 — RBAC Management Route

Buat `src/interfaces/http/routes/rbac.route.ts`:

```typescript
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
```

### 12.5 — PermissionGuard (Frontend)

Buat `apps/frontend/src/components/PermissionGuard.tsx`:

```tsx
import { useAuthStore } from '../stores/auth.store';
import { ReactNode } from 'react';

interface Props {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({ permission, fallback = null, children }: Props) {
  const { hasPermission } = useAuthStore();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}
```

### 12.6 — ProtectedRoute (Frontend)

Buat `apps/frontend/src/components/ProtectedRoute.tsx`:

```tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  requiredPermission?: string;
}

export function ProtectedRoute({ children, requiredPermission }: Props) {
  const { token, hasPermission } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (requiredPermission && !hasPermission(requiredPermission))
    return <div className="p-6 text-red-500">⛔ Akses Ditolak — kamu tidak punya permission untuk halaman ini.</div>;
  return <>{children}</>;
}
```

### 12.7 — App Router dengan Permission-Based Routing

Update `apps/frontend/src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SiswaPage from './pages/SiswaPage';
import GuruPage from './pages/GuruPage';
import JadwalPage from './pages/JadwalPage';
import NilaiPage from './pages/NilaiPage';
import AbsensiPage from './pages/AbsensiPage';
import LaporanPage from './pages/LaporanPage';
import Sidebar from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './stores/auth.store';

export default function App() {
  const { token } = useAuthStore();

  return (
    <BrowserRouter>
      {token && <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-gray-50 min-h-screen">
          <Routes>
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/siswa" element={<ProtectedRoute requiredPermission="read:siswa"><SiswaPage /></ProtectedRoute>} />
            <Route path="/guru" element={<ProtectedRoute requiredPermission="read:guru"><GuruPage /></ProtectedRoute>} />
            <Route path="/jadwal" element={<ProtectedRoute requiredPermission="read:jadwal"><JadwalPage /></ProtectedRoute>} />
            <Route path="/nilai" element={<ProtectedRoute requiredPermission="read:nilai"><NilaiPage /></ProtectedRoute>} />
            <Route path="/absensi" element={<ProtectedRoute requiredPermission="read:absensi"><AbsensiPage /></ProtectedRoute>} />
            <Route path="/laporan" element={<ProtectedRoute requiredPermission="read:laporan"><LaporanPage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>}
      {!token && <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>}
    </BrowserRouter>
  );
}
```

### 12.8 — Commit & Push

```bash
git add .
git commit -m "feat(rbac): RBACMiddleware + CheckPermission + AssignRole + PermissionGuard + ProtectedRoute"
git push origin feat/rbac
```

---

## 13. Environment Variables

### Backend (`apps/backend/.env`)

```env
DATABASE_URL="mysql://root:password_kamu@localhost:3306/eduaccess_db"
JWT_SECRET="eduaccess-secret-jwt-pwl-2025-super-rahasia"
PORT=3000
NODE_ENV=development
```

### Frontend (`apps/frontend/.env.local`)

```env
VITE_API_URL="http://localhost:3000"
```

> ⚠️ **JANGAN** commit `.env` atau `.env.local` ke GitHub.

---

## 14. Testing Lokal

```bash
# Terminal 1 — Backend
cd apps/backend
bun run dev

# Terminal 2 — Frontend
cd apps/frontend
bun run dev
```

### Akun Test Default (setelah seed)

| Email | Password | Role |
|-------|----------|------|
| `admin@eduaccess.id` | `admin123` | SUPERADMIN |

Buat akun tambahan via `POST /auth/register` dengan `roleName` sesuai kebutuhan.

### Testing Checklist per Fitur

**Auth:**
- [ ] Login → dapat token + roles + permissions
- [ ] Token tersimpan di localStorage via Zustand persist
- [ ] Redirect ke dashboard setelah login
- [ ] Logout → clear state, redirect ke login

**RBAC:**
- [ ] Login sebagai SUPERADMIN → semua menu muncul di Sidebar
- [ ] Login sebagai SISWA → hanya menu Nilai, Jadwal, Absensi
- [ ] Login sebagai GURU → tidak ada menu hapus siswa
- [ ] Hit endpoint tanpa token → 401
- [ ] Hit endpoint tanpa permission → 403

**Siswa:**
- [ ] TATA_USAHA bisa tambah siswa
- [ ] KEPALA_SEKOLAH hanya bisa lihat, tidak bisa hapus
- [ ] SISWA tidak bisa akses halaman siswa orang lain

**Nilai & Absensi:**
- [ ] GURU bisa input nilai siswa di kelasnya
- [ ] SISWA bisa lihat nilainya sendiri

**Dashboard:**
- [ ] Statistik muncul untuk KEPALA_SEKOLAH dan SUPERADMIN
- [ ] SISWA mendapat dashboard yang berbeda (info pribadi)

---

## 15. Checklist Pengumpulan

### Backend ✅

- [ ] `POST /auth/register` — register dengan roleName
- [ ] `POST /auth/login` — dapat JWT + roles + permissions
- [ ] `GET /siswa` — butuh permission `read:siswa`
- [ ] `POST /siswa` — butuh permission `create:siswa`
- [ ] `GET /guru` — butuh permission `read:guru`
- [ ] `GET /jadwal` — butuh permission `read:jadwal`
- [ ] `POST /nilai` — butuh permission `create:nilai`
- [ ] `GET /absensi/siswa/:id` — butuh permission `read:absensi`
- [ ] `GET /laporan/statistik` — butuh permission `read:laporan`
- [ ] `GET /rbac/roles` — butuh permission `manage:role`
- [ ] `POST /rbac/assign-role` — butuh permission `manage:role`
- [ ] Endpoint tanpa token → 401; tanpa permission → 403

### Frontend ✅

- [ ] Login page berfungsi
- [ ] Zustand auth store dengan persist
- [ ] Sidebar hanya tampilkan menu sesuai permission
- [ ] PermissionGuard menyembunyikan tombol tanpa permission
- [ ] ProtectedRoute redirect jika tidak login atau tidak punya permission
- [ ] Semua halaman fetch data dari backend

### RBAC Schema ✅

- [ ] 5 tabel wajib: `User`, `Role`, `Permission`, `UserRole`, `RolePermission`
- [ ] 7 Role: SUPERADMIN, KEPALA_SEKOLAH, TATA_USAHA, GURU, SISWA, WALI_MURID, OPERATOR
- [ ] Minimal 20 permission terdefinisi di seed
- [ ] Mapping role-permission sesuai tabel di bagian 3

### Database ✅

- [ ] Migration berhasil (`bunx prisma migrate dev`)
- [ ] Seed berhasil (`bun run db:seed`)
- [ ] Data tampil di Prisma Studio (`bun run db:studio`)

### Repo ✅

- [ ] Semua fitur via PR ke `main`
- [ ] ERD ada di `docs/ERD.md`
- [ ] `.env` di `.gitignore`
- [ ] `README.md` berisi instruksi setup

---

## 16. Troubleshooting

### Backend

**Error: `P2002` — Unique constraint failed**
```bash
# Data sudah ada di DB. Gunakan upsert, atau reset DB:
bunx prisma migrate reset
bun run db:seed
```

**Error: `JWT malformed`**
```typescript
// Pastikan header dikirim dengan format:
// Authorization: Bearer <token>
// Bukan hanya: Bearer token (tanpa spasi)
```

**Error: `P1001` — Can't reach database**
```bash
# Cek MySQL berjalan:
sudo systemctl status mysql
# Cek DATABASE_URL di .env sudah benar
```

### Frontend

**Error: `VITE_API_URL` undefined**
```bash
echo 'VITE_API_URL="http://localhost:3000"' > apps/frontend/.env.local
```

**Permission check tidak akurat setelah login**
```typescript
// Pastikan Zustand store menyimpan permissions dari response login
// Cek: localStorage → "eduaccess-auth" → permissions array ada?
```

**Sidebar tidak update setelah login**
```typescript
// Pastikan komponen Sidebar subscribe ke useAuthStore()
// Jangan cache hasPermission di luar komponen
```

### Git

```bash
# Cek file conflict
git status

# Resolve conflict lalu:
git add <file>
git commit -m "fix: resolve merge conflict"
git push origin feat/<branch-kamu>
```

---

## 📝 Catatan Akhir

- **Koordinasi:** Anggota7 wajib push `RBACMiddleware.ts` dan `PermissionGuard.tsx` lebih awal — anggota lain bergantung pada file ini.
- **Urutan pengerjaan:** Anggota1 setup dulu → Anggota7 push middleware → Anggota2-6 mulai fitur.
- **Seed data:** Selalu jalankan `bun run db:seed` setelah `migrate reset` agar role dan permission tidak hilang.
- **Test RBAC:** Login dengan role berbeda-beda untuk memastikan permission benar-benar diterapkan, bukan hanya disembunyikan di UI.

**Sukses untuk proyek EduAccess! 🚀**
