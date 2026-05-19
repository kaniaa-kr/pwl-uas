import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { authRoute } from './routes/auth.route';
import { siswaRoute } from './routes/siswa.route';
import { kelasRoute } from './routes/kelas.route';
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
  .use(kelasRoute)
  .use(guruRoute)
  .use(nilaiRoute)
  .use(absensiRoute)
  .use(jadwalRoute)
  .use(laporanRoute)
  .use(rbacRoute)
  .get('/', () => ({ status: 'EduAccess API berjalan ✅' }))
  .listen(process.env.PORT || 3000);

console.log(`🦊 Backend berjalan di http://localhost:${app.server?.port}`);