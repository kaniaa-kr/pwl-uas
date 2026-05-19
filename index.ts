import { Elysia, t } from 'elysia';
import { html } from '@elysiajs/html';

// 1. STATE SIMULASI GEDUNG (In-Memory)
let systemState = {
  doorLocked: true,
  cctvOnline: true,
  logs: [
    { time: "16:00", user: "Sistem", action: "CCTV Aktif", type: "info" }
  ]
};

// Menyimpan semua koneksi WebSocket yang aktif
const clients = new Set<any>();

function broadcast(htmlContent: string) {
  for (const client of clients) {
    client.send(htmlContent);
  }
}

// 2. TEMPLATE UI (Tailwind + HTMX WebSocket Extension)
const renderDashboard = (role: string) => `
<div class="p-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
  
  <!-- KENDALI PERANGKAT (Admin Only / View Only for Mod) -->
  <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
    <h3 class="text-lg font-bold mb-4 text-indigo-400 flex items-center gap-2">
      ⚙️ Kendali Fasilitas <span class="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">${role}</span>
    </h3>
    
    <div class="space-y-4">
      <!-- PINTU -->
      <div class="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
        <div>
          <p class="font-semibold">Pintu Utama</p>
          <p class="text-xs ${systemState.doorLocked ? 'text-red-400' : 'text-green-400'}" id="door-status">
            ${systemState.doorLocked ? '🔒 Terkunci' : '🔓 Terbuka'}
          </p>
        </div>
        ${role === 'Admin' ? `
          <button hx-post="/toggle-door" hx-swap="none" class="bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded text-sm font-medium transition">
            Toggle
          </button>
        ` : '<span class="text-xs text-gray-500">Read-Only</span>'}
      </div>

      <!-- CCTV -->
      <div class="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
        <div>
          <p class="font-semibold">Kamera CCTV 01</p>
          <p class="text-xs ${systemState.cctvOnline ? 'text-green-400' : 'text-red-400'}" id="cctv-status">
            ${systemState.cctvOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
          </p>
        </div>
        ${role === 'Admin' ? `
          <button hx-post="/toggle-cctv" hx-swap="none" class="bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded text-sm font-medium transition">
            Toggle
          </button>
        ` : '<span class="text-xs text-gray-500">Read-Only</span>'}
      </div>
    </div>

    <!-- FITUR KHUSUS USER (Request Akses) -->
    ${role === 'User' ? `
      <div class="mt-6 pt-6 border-t border-gray-700">
        <button hx-post="/request-access" hx-swap="none" class="w-full bg-emerald-600 hover:bg-emerald-700 py-2 rounded font-bold transition">
          🔔 Ketuk Pintu (Minta Akses Masuk)
        </button>
      </div>
    ` : ''}
  </div>

  <!-- REAL-TIME LOGS (Admin & Moderator) -->
  <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col h-[300px]">
    <h3 class="text-lg font-bold mb-3 text-indigo-400">📜 Live Activity Log</h3>
    ${role !== 'User' ? `
      <div id="log-container" hx-ext="ws" ws-connect="/ws" class="flex-1 overflow-y-auto space-y-2 font-mono text-xs bg-gray-900 p-3 rounded-lg border border-gray-700">
        ${renderLogs()}
      </div>
    ` : `
      <div class="flex-1 flex items-center justify-center bg-gray-900 rounded-lg border border-gray-700 p-4 text-center">
        <p class="text-sm text-gray-500">❌ Log aktivitas dirahasiakan dari role User biasa.</p>
      </div>
    `}
  </div>
</div>
`;

const renderLogs = () => systemState.logs.map(l => `
  <p class="border-b border-gray-800 pb-1">
    <span class="text-gray-500">[${l.time}]</span> 
    <span class="text-amber-400 font-semibold">${l.user}:</span> 
    <span class="${l.type === 'alert' ? 'text-red-400 font-bold animate-pulse' : 'text-gray-300'}">${l.action}</span>
  </p>
`).join('');


// 3. CORE APPS & ROUTING
const app = new Elysia()
  .use(html())
  
  // Halaman Utama dengan Switcher Role
  .get('/', ({ query }) => {
    const activeRole = (query.role as string) || 'Admin';
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>IoT RBAC Command Center</title>
        <script src="https://unpkg.com/htmx.org@1.9.10"></script>
        <script src="https://unpkg.com/htmx.org/ext/ws.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-900 text-gray-100 min-h-screen">
        <nav class="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
          <h1 class="text-xl font-bold text-indigo-400">🚨 CyberGuard Command</h1>
          <form method="GET" class="flex items-center gap-2">
            <span class="text-sm text-gray-400">Mode Simulasi:</span>
            <select name="role" onchange="this.form.submit()" class="bg-gray-700 text-white rounded p-1 text-sm border border-gray-600">
              <option value="Admin" ${activeRole === 'Admin' ? 'selected' : ''}>Admin (Full Control)</option>
              <option value="Moderator" ${activeRole === 'Moderator' ? 'selected' : ''}>Moderator (Monitor)</option>
              <option value="User" ${activeRole === 'User' ? 'selected' : ''}>User (Karyawan)</option>
            </select>
          </form>
        </nav>
        <div id="dashboard-root">${renderDashboard(activeRole)}</div>
      </body>
      </html>
    `;
  })

  // ENDPOINT AKSI (Dengan Proteksi Role Sederhana)
  .post('/toggle-door', () => {
    // Simulasi jika beneran dicek di server (Hardcoded Admin bypass untuk contoh instan)
    systemState.doorLocked = !systemState.doorLocked;
    
    // Tambah log
    systemState.logs.unshift({
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
      user: "Admin",
      action: systemState.doorLocked ? "Mengunci Pintu Utama" : "Membuka Pintu Utama",
      type: "info"
    });

    // Dorong perubahan secara REAl-TIME ke semua screen petugas lewat WebSocket
    broadcast(`<div id="log-container" hx-swap-oob="innerHTML">${renderLogs()}</div>`);
  })

  .post('/toggle-cctv', () => {
    systemState.cctvOnline = !systemState.cctvOnline;
    systemState.logs.unshift({
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
      user: "Admin",
      action: systemState.cctvOnline ? "Menyalakan CCTV 01" : "MEMATIKAN CCTV 01",
      type: systemState.cctvOnline ? "info" : "alert"
    });
    broadcast(`<div id="log-container" hx-swap-oob="innerHTML">${renderLogs()}</div>`);
  })

  .post('/request-access', () => {
    systemState.logs.unshift({
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
      user: "Karyawan (User)",
      action: "Mencoba mengetuk pintu! Meminta akses masuk.",
      type: "alert"
    });
    // Kirim notifikasi real-time ke Admin & Mod tanpa mengganggu layar si User
    broadcast(`<div id="log-container" hx-swap-oob="innerHTML">${renderLogs()}</div>`);
  })

  // WEBSOCKET HANDLER (Native Bun & Elysia)
  .ws('/ws', {
    open(ws) {
      clients.add(ws);
    },
    close(ws) {
      clients.delete(ws);
    }
  })
  
  .listen(3000);

console.log(`🚀 Command Center aktif di http://localhost:3000`);