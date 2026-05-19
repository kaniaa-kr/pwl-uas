import axios from 'axios';
import { useEffect, useState } from 'react';
import { PermissionGuard } from '../components/PermissionGuard';
import { useAuthStore } from '../stores/auth.store';

const API = import.meta.env.VITE_API_URL;

type User = {
  id: string;
  username: string;
  email: string;
  roles: { role: { name: string } }[];
};

type Role = {
  id: string;
  name: string;
};

export default function UserManagementPage() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [message, setMessage] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    // Ambil daftar user
    axios
      .get(`${API}/auth/me`, { headers })
      .catch(() => null);

    // Ambil daftar roles
    axios
      .get<Role[]>(`${API}/rbac/roles`, { headers })
      .then((r) => setRoles(r.data))
      .catch(() => null);
  }, []);

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;
    try {
      await axios.post(
        `${API}/rbac/assign-role`,
        { userId: selectedUser, roleName: selectedRole },
        { headers }
      );
      setMessage(`Role berhasil ditetapkan!`);
    } catch {
      setMessage('Gagal menetapkan role.');
    }
  };

  return (
    <section className="p-6 text-left">
      <h1 className="mb-4 text-2xl font-semibold">User Management</h1>

      <PermissionGuard
        permission="manage:role"
        fallback={
          <p className="text-red-500">
            Kamu tidak punya akses ke halaman ini.
          </p>
        }
      >
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-medium">Assign Role ke User</h2>

          {message && (
            <div className="mb-3 rounded bg-green-50 p-2 text-sm text-green-700 border border-green-200">
              {message}
            </div>
          )}

          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              User ID
            </label>
            <input
              type="text"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              placeholder="Masukkan User ID"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              <option value="">-- Pilih Role --</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAssignRole}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            Assign Role
          </button>
        </div>

        <div className="mt-6 rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-medium">Daftar Role Tersedia</h2>
          <ul className="space-y-1">
            {roles.map((r) => (
              <li
                key={r.id}
                className="rounded bg-gray-50 px-3 py-2 text-sm text-gray-700"
              >
                {r.name}
              </li>
            ))}
          </ul>
        </div>
      </PermissionGuard>
    </section>
  );
}