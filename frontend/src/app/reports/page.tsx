"use client";

import React, { useEffect, useMemo, useState } from "react";

type Client = { id: string; name: string };

type Money = { amount: number; currency: string };

type Kpis = {
  invoicesCount: number;
  invoicesTotal: Money;
  paymentsCount: number;
  paymentsTotal: Money;
  pendingTotal: Money;
  upcomingDueCount: number;
  alertsCount: number;
};

type MonthlyPoint = {
  period: string; // "2026-02" o similar
  invoicesTotal: Money;
  paymentsTotal: Money;
  pendingTotal: Money;
};

type DueItem = {
  id: string;
  dueDate: string; // ISO
  concept: string;
  amount: Money;
  status: "PENDING" | "SUBMITTED" | "PAID" | "OVERDUE";
};

type MovementItem = {
  id: string;
  date: string; // ISO
  type: "INVOICE" | "PAYMENT" | "ADJUSTMENT";
  description: string;
  amount: Money;
  status: "DRAFT" | "PENDING" | "PAID" | "CANCELLED";
};

type ReportsSummary = {
  scope: "GLOBAL" | "CLIENT";
  client?: { id: string; name: string } | null;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  kpis: Kpis;
  monthly: MonthlyPoint[];
  duePreview: DueItem[];
  movementsPreview: MovementItem[];
};

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatMoney(m: Money) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: m.currency || "ARS",
      maximumFractionDigits: 0,
    }).format(m.amount ?? 0);
  } catch {
    return `${m.currency ?? "ARS"} ${m.amount ?? 0}`;
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-AR");
}

function isoDate(d: Date) {
  // YYYY-MM-DD (sin timezone issues para UI)
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function defaultLast30Days() {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 30);
  return { from: isoDate(from), to: isoDate(to) };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${txt || res.statusText}`);
  }
  return res.json();
}

function StatusPill({ value }: { value: string }) {
  const cls =
    value === "PAID"
      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
      : value === "OVERDUE"
      ? "bg-rose-500/15 text-rose-300 ring-rose-500/30"
      : value === "PENDING"
      ? "bg-amber-500/15 text-amber-300 ring-amber-500/30"
      : value === "SUBMITTED"
      ? "bg-sky-500/15 text-sky-300 ring-sky-500/30"
      : "bg-zinc-500/15 text-zinc-200 ring-zinc-500/30";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 ${cls}`}>
      {value}
    </span>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl bg-black/60 ring-1 ring-white/10 p-4 shadow-sm">
      <div className="text-sm text-white/70">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      {subtitle ? <div className="mt-1 text-xs text-white/50">{subtitle}</div> : null}
    </div>
  );
}

export default function ReportsPage() {
  const [clientQuery, setClientQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [clientLoading, setClientLoading] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState<string>(""); // "" = GLOBAL
  const [range, setRange] = useState(() => defaultLast30Days());

  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const scopeLabel = useMemo(() => {
    if (!selectedClientId) return "Global";
    const c = clients.find((x) => x.id === selectedClientId);
    return c ? c.name : "Cliente";
  }, [selectedClientId, clients]);

  // Buscar clientes (simple, sin debounce para MVP)
  useEffect(() => {
    let cancelled = false;
    async function run() {
      setClientLoading(true);
      try {
        const url = `${baseUrl}/clients?search=${encodeURIComponent(clientQuery)}`;
        const data = await fetchJson<Client[]>(url);
        if (!cancelled) setClients(data ?? []);
      } catch {
        if (!cancelled) setClients([]);
      } finally {
        if (!cancelled) setClientLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [clientQuery]);

  // Cargar resumen (global o por cliente)
  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams({
          from: range.from,
          to: range.to,
        });
        if (selectedClientId) params.set("clientId", selectedClientId);

        const url = `${baseUrl}/reports/summary?${params.toString()}`;
        const data = await fetchJson<ReportsSummary>(url);
        if (!cancelled) setSummary(data);
      } catch (e: any) {
        if (!cancelled) {
          setSummary(null);
          setErr(e?.message ?? "Error cargando reportes");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedClientId, range.from, range.to]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Reportes</h1>
            <p className="mt-1 text-sm text-white/70">
              Resumen <span className="font-semibold text-white">{scopeLabel}</span> • Últimos 30 días (editable)
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            {/* Cliente */}
            <div className="w-full md:w-72">
              <label className="text-xs text-white/60">Cliente (opcional)</label>
              <div className="mt-1 rounded-xl bg-black/50 ring-1 ring-white/10 p-2">
                <input
                  className="w-full rounded-lg bg-black/40 px-3 py-2 text-sm outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-2 focus:ring-blue-400/60"
                  placeholder="Buscar cliente…"
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                />
                <div className="mt-2 flex items-center gap-2">
                  <select
                    className="w-full rounded-lg bg-black/40 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-blue-400/60"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                  >
                    <option value="">(Global)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {clientLoading ? <span className="text-xs text-white/50">…</span> : null}
                </div>
              </div>
            </div>

            {/* Rango */}
            <div className="w-full md:w-72">
              <label className="text-xs text-white/60">Rango</label>
              <div className="mt-1 rounded-xl bg-black/50 ring-1 ring-white/10 p-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[11px] text-white/50 mb-1">Desde</div>
                    <input
                      type="date"
                      className="w-full rounded-lg bg-black/40 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-blue-400/60"
                      value={range.from}
                      onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
                    />
                  </div>
                  <div>
                    <div className="text-[11px] text-white/50 mb-1">Hasta</div>
                    <input
                      type="date"
                      className="w-full rounded-lg bg-black/40 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-blue-400/60"
                      value={range.to}
                      onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-xs ring-1 ring-white/10 hover:bg-white/15"
                    onClick={() => setRange(defaultLast30Days())}
                  >
                    Últimos 30 días
                  </button>
                  <button
                    className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-xs ring-1 ring-white/10 hover:bg-white/15"
                    onClick={() => {
                      const to = new Date();
                      const from = new Date();
                      from.setMonth(to.getMonth() - 3);
                      setRange({ from: isoDate(from), to: isoDate(to) });
                    }}
                  >
                    Últimos 3 meses
                  </button>
                </div>
              </div>
            </div>

            {/* Export */}
            <div className="flex gap-2">
              <button
                disabled
                className="rounded-xl bg-black/40 px-4 py-3 text-sm ring-1 ring-white/10 opacity-60 cursor-not-allowed"
                title="MVP: pronto"
              >
                Exportar PDF
              </button>
              <button
                disabled
                className="rounded-xl bg-black/40 px-4 py-3 text-sm ring-1 ring-white/10 opacity-60 cursor-not-allowed"
                title="MVP: pronto"
              >
                Exportar Excel
              </button>
              <button
                    onClick={() => (window.location.href = "/dashboard")}
                className="rounded-xl bg-black/60 hover:bg-black/40 border border-blue-500/40 px-4 py-2 transition"
            >
                ← Volver al dashboard
              </button>

            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl bg-black/40 ring-1 ring-white/10 p-6 text-white/70">
              Cargando reportes…
            </div>
          ) : err ? (
            <div className="rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/30 p-6">
              <div className="font-semibold">No se pudo cargar el resumen</div>
              <div className="mt-1 text-sm text-white/70">{err}</div>
              <div className="mt-3 text-xs text-white/50">
                Verificá que el backend esté corriendo en <span className="font-mono">{baseUrl}</span> y que existan los endpoints.
              </div>
            </div>
          ) : summary ? (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <KpiCard
                  title="Facturas"
                  value={`${summary.kpis.invoicesCount}`}
                  subtitle={formatMoney(summary.kpis.invoicesTotal)}
                />
                <KpiCard
                  title="Pagos"
                  value={`${summary.kpis.paymentsCount}`}
                  subtitle={formatMoney(summary.kpis.paymentsTotal)}
                />
                <KpiCard title="Pendiente" value={formatMoney(summary.kpis.pendingTotal)} subtitle="Saldo abierto" />
                <KpiCard title="Vencimientos" value={`${summary.kpis.upcomingDueCount}`} subtitle="Próximos" />
                <KpiCard title="Alertas" value={`${summary.kpis.alertsCount}`} subtitle="Revisar" />
                <KpiCard title="Período" value={`${summary.from} → ${summary.to}`} subtitle={summary.scope} />
              </div>

              {/* Sección: Evolución (placeholder en MVP) */}
              <div className="mt-6 rounded-2xl bg-black/60 ring-1 ring-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">Evolución</div>
                    <div className="text-xs text-white/60">Ingresos / Pagos / Pendiente por período</div>
                  </div>
                  <div className="text-xs text-white/50">MVP: tabla (después gráfico)</div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-white/60">
                      <tr className="border-b border-white/10">
                        <th className="py-2 text-left font-medium">Período</th>
                        <th className="py-2 text-right font-medium">Facturado</th>
                        <th className="py-2 text-right font-medium">Pagado</th>
                        <th className="py-2 text-right font-medium">Pendiente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.monthly?.length ? (
                        summary.monthly.map((p) => (
                          <tr key={p.period} className="border-b border-white/5">
                            <td className="py-2">{p.period}</td>
                            <td className="py-2 text-right">{formatMoney(p.invoicesTotal)}</td>
                            <td className="py-2 text-right">{formatMoney(p.paymentsTotal)}</td>
                            <td className="py-2 text-right">{formatMoney(p.pendingTotal)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-6 text-white/60" colSpan={4}>
                            Sin datos para el período.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tablas rápidas */}
              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Movimientos */}
                <div className="rounded-2xl bg-black/60 ring-1 ring-white/10 p-5">
                  <div className="text-lg font-semibold">Últimos movimientos</div>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-white/60">
                        <tr className="border-b border-white/10">
                          <th className="py-2 text-left font-medium">Fecha</th>
                          <th className="py-2 text-left font-medium">Tipo</th>
                          <th className="py-2 text-left font-medium">Detalle</th>
                          <th className="py-2 text-right font-medium">Monto</th>
                          <th className="py-2 text-right font-medium">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.movementsPreview?.length ? (
                          summary.movementsPreview.map((m) => (
                            <tr key={m.id} className="border-b border-white/5">
                              <td className="py-2">{formatDate(m.date)}</td>
                              <td className="py-2">{m.type}</td>
                              <td className="py-2 text-white/80">{m.description}</td>
                              <td className="py-2 text-right">{formatMoney(m.amount)}</td>
                              <td className="py-2 text-right">
                                <StatusPill value={m.status} />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="py-6 text-white/60" colSpan={5}>
                              Sin movimientos recientes.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Vencimientos */}
                <div className="rounded-2xl bg-black/60 ring-1 ring-white/10 p-5">
                  <div className="text-lg font-semibold">Próximos vencimientos</div>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-white/60">
                        <tr className="border-b border-white/10">
                          <th className="py-2 text-left font-medium">Vence</th>
                          <th className="py-2 text-left font-medium">Concepto</th>
                          <th className="py-2 text-right font-medium">Monto</th>
                          <th className="py-2 text-right font-medium">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.duePreview?.length ? (
                          summary.duePreview.map((d) => (
                            <tr key={d.id} className="border-b border-white/5">
                              <td className="py-2">{formatDate(d.dueDate)}</td>
                              <td className="py-2 text-white/80">{d.concept}</td>
                              <td className="py-2 text-right">{formatMoney(d.amount)}</td>
                              <td className="py-2 text-right">
                                <StatusPill value={d.status} />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="py-6 text-white/60" colSpan={4}>
                              Sin vencimientos próximos.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-black/40 ring-1 ring-white/10 p-6 text-white/70">
              Sin datos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}