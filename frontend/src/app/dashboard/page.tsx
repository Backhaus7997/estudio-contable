"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

type StoredUser = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
};

function safeParseUser(raw: string | null): StoredUser | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

function formatTodayAR() {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

// ---- Mock data (luego lo conectamos al backend) ----
// Facturación últimos 12 meses (monto total)
const billingMonthly = [
  { month: "Mar", total: 1200000 },
  { month: "Abr", total: 950000 },
  { month: "May", total: 1430000 },
  { month: "Jun", total: 1650000 },
  { month: "Jul", total: 1320000 },
  { month: "Ago", total: 1780000 },
  { month: "Sep", total: 1600000 },
  { month: "Oct", total: 2100000 },
  { month: "Nov", total: 1950000 },
  { month: "Dic", total: 2500000 },
  { month: "Ene", total: 1820000 },
  { month: "Feb", total: 2050000 },
];

// Vencimientos próximos por tipo (count)
const dueByType = [
  { type: "IVA", count: 3 },
  { type: "IIBB", count: 2 },
  { type: "Ganancias", count: 1 },
  { type: "Sueldos", count: 1 },
];

// Helpers visuales
function formatARS(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

const tooltipStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.9)",
  border: "1px solid rgba(59,130,246,0.6)", // blue-500-ish
  borderRadius: 12,
  color: "#DBEAFE", // blue-100-ish
};

export default function DashboardPage() {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const u = safeParseUser(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setUser(u);
  }, []);

  const displayName = useMemo(() => {
    if (!user) return "Usuario";
    return user.name || user.email || "Usuario";
  }, [user]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Datos mock (cards)
  const kpis = [
    { label: "Clientes", value: "24", hint: "+2 esta semana" },
    { label: "Facturas emitidas", value: "118", hint: "Últimos 30 días" },
    { label: "Vencimientos", value: "7", hint: "Próximos 10 días" },
    { label: "Alertas", value: "3", hint: "Requieren acción" },
  ];

  const quickActions = [
    { title: "Clientes", desc: "Alta, baja y gestión", href: "/clientes" },
    { title: "Facturación", desc: "Emitir y revisar", href: "/facturacion" },
    { title: "Impuestos", desc: "Calendario y DDJJ", href: "/impuestos" },
    { title: "Reportes", desc: "Resumen por cliente", href: "/reports" },
  ];

  const activity = [
    { title: "Factura #A-000123 emitida", meta: "Cliente: Acme SRL · Hace 2 hs" },
    { title: "Recordatorio de vencimiento creado", meta: "IVA · En 5 días" },
    { title: "Cliente actualizado", meta: "Estudio: Demo · Ayer" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-black text-blue-100">
      {/* Header */}
      <header className="w-full px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-500">
              Estudio Contable
            </h1>
            <p className="text-blue-200 mt-1 capitalize">{formatTodayAR()}</p>
          </div>

          <div className="bg-black bg-opacity-80 border border-blue-800 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
            <div className="hidden sm:block">
              <p className="text-sm text-blue-200">Sesión iniciada</p>
              <p className="font-semibold text-blue-100">{displayName}</p>
            </div>
            <button
              onClick={logout}
              className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-150"
              type="button"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="px-6 pb-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome card */}
          <section className="bg-black bg-opacity-80 rounded-xl shadow-lg p-6 border border-blue-900">
            <h2 className="text-2xl font-bold text-blue-400">
              Bienvenido, {displayName}
            </h2>
            <p className="text-blue-200 mt-2">
              Este es tu panel principal. Acá vas a ver métricas, vencimientos y accesos rápidos.
            </p>
          </section>

          {/* KPI cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="bg-black bg-opacity-80 rounded-xl shadow-lg p-5 border border-blue-900"
              >
                <p className="text-sm text-blue-200">{k.label}</p>
                <p className="text-3xl font-extrabold text-blue-400 mt-2">
                  {k.value}
                </p>
                <p className="text-xs text-blue-300 mt-2">{k.hint}</p>
              </div>
            ))}
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Line chart: facturación */}
            <div className="bg-black bg-opacity-80 rounded-xl shadow-lg p-6 border border-blue-900">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-blue-400">
                  Facturación (últimos 12 meses)
                </h3>
                <span className="text-xs text-blue-300">Mock</span>
              </div>

              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={billingMonthly}>
                    <CartesianGrid stroke="rgba(59,130,246,0.15)" />
                    <XAxis dataKey="month" stroke="rgba(219,234,254,0.6)" />
                    <YAxis
                      stroke="rgba(219,234,254,0.6)"
                      tickFormatter={(v) =>
                        new Intl.NumberFormat("es-AR", {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(Number(v))
                      }
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => formatARS(Number(value))}
                      labelStyle={{ color: "#93C5FD" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#60A5FA"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar chart: vencimientos */}
            <div className="bg-black bg-opacity-80 rounded-xl shadow-lg p-6 border border-blue-900">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-blue-400">
                  Vencimientos próximos (por tipo)
                </h3>
                <span className="text-xs text-blue-300">Mock</span>
              </div>

              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dueByType}>
                    <CartesianGrid stroke="rgba(59,130,246,0.15)" />
                    <XAxis dataKey="type" stroke="rgba(219,234,254,0.6)" />
                    <YAxis stroke="rgba(219,234,254,0.6)" allowDecimals={false} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [`${value}`, "Cantidad"]}
                      labelStyle={{ color: "#93C5FD" }}
                    />
                    <Legend wrapperStyle={{ color: "rgba(219,234,254,0.7)" }} />
                    <Bar dataKey="count" name="Cantidad" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="text-xs text-blue-300 mt-3">
                Tip: después lo cambiamos a “por semana” o “por cliente” cuando tengamos datos reales.
              </p>
            </div>
          </section>

          {/* Quick actions */}
          <section className="bg-black bg-opacity-80 rounded-xl shadow-lg p-6 border border-blue-900">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-blue-400">Accesos rápidos</h3>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((a) => (
                <a
                  key={a.title}
                  href={a.href}
                  className="group block rounded-xl border border-blue-800 bg-blue-950/40 hover:bg-blue-950/70 transition p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-blue-100">{a.title}</p>
                    <span className="text-blue-300 group-hover:text-blue-200 transition">→</span>
                  </div>
                  <p className="text-sm text-blue-200 mt-2">{a.desc}</p>
                </a>
              ))}
            </div>
          </section>

          {/* Activity + alerts */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-black bg-opacity-80 rounded-xl shadow-lg p-6 border border-blue-900">
              <h3 className="text-xl font-bold text-blue-400">Actividad reciente</h3>
              <div className="mt-4 space-y-3">
                {activity.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-blue-900 bg-blue-950/30 p-4"
                  >
                    <p className="font-semibold text-blue-100">{item.title}</p>
                    <p className="text-sm text-blue-200 mt-1">{item.meta}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black bg-opacity-80 rounded-xl shadow-lg p-6 border border-blue-900">
              <h3 className="text-xl font-bold text-blue-400">Centro de alertas</h3>
              <p className="text-blue-200 mt-2">
                Próximo paso: conectar backend para alertas reales.
              </p>

              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-blue-900 bg-blue-950/30 p-4">
                  <p className="font-semibold text-blue-100">IVA</p>
                  <p className="text-sm text-blue-200 mt-1">Vence en 5 días · Revisar borrador</p>
                </div>
                <div className="rounded-lg border border-blue-900 bg-blue-950/30 p-4">
                  <p className="font-semibold text-blue-100">Sueldos</p>
                  <p className="text-sm text-blue-200 mt-1">Pendiente de carga · 2 clientes</p>
                </div>
                <button
                  type="button"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-150"
                  onClick={() => alert("Acción placeholder")}
                >
                  Ver alertas
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-2 text-center text-blue-300 text-sm">
            © 2026 Code Assurance. Todos los derechos reservados.
          </footer>
        </div>
      </main>
    </div>
  );
}