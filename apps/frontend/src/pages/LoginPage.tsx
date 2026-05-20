import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      const { token, user } = res.data as {
        token: string;
        user: {
          id: string;
          username: string;
          email: string;
          roles: string[];
          permissions: string[];
        };
      };
      setAuth(token, user);
      navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Login gagal');
      } else {
        setError('Terjadi kesalahan');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-white">
      {/* Left side - Login Form */}
      <section className="flex w-full flex-col justify-center px-8 md:w-1/2 lg:px-24 xl:px-32">
        <div className="mx-auto w-full max-w-sm text-left">
          <div className="mb-10 text-center md:text-left">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-2xl font-bold text-white shadow-lg">
              EA
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Selamat Datang</h1>
            <p className="mt-2 text-sm text-gray-500">
              Masuk ke sistem manajemen EduAccess
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600 ring-1 ring-inset ring-red-500/10">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eduaccess.id"
                  className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full justify-center items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center md:text-left">
            <p className="text-xs font-medium text-gray-500">
              Akun Demo: <span className="text-gray-800">admin@eduaccess.id</span> / <span className="text-gray-800">admin123</span>
            </p>
          </div>
        </div>
      </section>

      {/* Right side - Image Background */}
      <section className="relative hidden w-1/2 md:block overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900/20 mix-blend-multiply z-10" />
        <img
          src="/login-bg.png"
          alt="EduAccess Abstract Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent z-20" />
        <div className="absolute bottom-16 left-16 right-16 text-white z-30 text-left">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Modernisasi Pendidikan</h2>
          <p className="text-lg text-gray-200 opacity-90 max-w-lg leading-relaxed">
            Platform komprehensif untuk manajemen sekolah, memantau absensi siswa, penjadwalan guru, dan rekapitulasi nilai dalam satu pintu.
          </p>
        </div>
      </section>
    </main>
  );
}