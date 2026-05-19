import { useAuthStore } from '../stores/auth.store';

const defaultPermissions = [
  'read:siswa',
  'read:guru',
  'read:jadwal',
  'read:nilai',
  'read:absensi',
  'read:laporan',
];

export default function LoginPage() {
  const { setAuth } = useAuthStore();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <section className="w-full max-w-sm rounded-lg border bg-white p-6 text-left shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">Login</h1>
        <p className="mb-6 text-sm text-gray-600">Masuk sementara untuk mencoba halaman RBAC.</p>
        <button
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-white"
          onClick={() => setAuth('demo-token', defaultPermissions)}
        >
          Masuk sebagai demo
        </button>
      </section>
    </main>
  );
}
