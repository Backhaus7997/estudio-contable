// app/impuestos/page.tsx
"use client";

import React, { useMemo, useState } from "react";

type Deadline = {
  id: string;
  title: string;        // ej: "IVA Mensual"
  taxpayer: string;     // ej: "Cliente: ACME SA"
  date: string;         // ISO: "2026-02-18"
  priority?: "alta" | "media" | "baja";
};

type DJJJ = {
  id: string;
  period: string;       // ej: "2026-01"
  tax: string;          // ej: "IVA"
  taxpayer: string;     // ej: "ACME SA"
  status: "pendiente" | "en_proceso" | "presentada" | "vencida";
  dueDate: string;      // ISO
  updatedAt: string;    // ISO
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toDateOnlyISO(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseISODate(iso: string) {
  // iso "YYYY-MM-DD" -> Date local (sin timezone issues grandes)
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}
function dayLabel(i: number) {
  // L a D (Argentina típico)
  return ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i]!;
}
function weekdayIndexMondayFirst(d: Date) {
  // JS: 0=Dom..6=Sáb -> queremos 0=Lun..6=Dom
  const js = d.getDay();
  return (js + 6) % 7;
}

function statusPill(status: DJJJ["status"]) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border";
  switch (status) {
    case "presentada":
      return cn(base, "bg-emerald-950/40 text-emerald-300 border-emerald-800");
    case "en_proceso":
      return cn(base, "bg-sky-950/40 text-sky-300 border-sky-800");
    case "pendiente":
      return cn(base, "bg-amber-950/40 text-amber-300 border-amber-800");
    case "vencida":
      return cn(base, "bg-rose-950/40 text-rose-300 border-rose-800");
    default:
      return cn(base, "bg-zinc-900 text-zinc-200 border-zinc-700");
  }
}

const mockDeadlines: Deadline[] = [
  { id: "d1", title: "IVA Mensual", taxpayer: "Cliente: ACME SA", date: "2026-02-18", priority: "alta" },
  { id: "d2", title: "SICORE", taxpayer: "Cliente: Beta SRL", date: "2026-02-20", priority: "media" },
  { id: "d3", title: "Ingresos Brutos", taxpayer: "Cliente: ACME SA", date: "2026-02-24", priority: "media" },
  { id: "d4", title: "Autónomos", taxpayer: "Cliente: Juan Pérez", date: "2026-02-05", priority: "baja" },
];

const mockDDJJ: DJJJ[] = [
  { id: "r1", period: "2026-01", tax: "IVA", taxpayer: "ACME SA", status: "en_proceso", dueDate: "2026-02-18", updatedAt: "2026-02-10" },
  { id: "r2", period: "2026-01", tax: "IIBB", taxpayer: "ACME SA", status: "pendiente", dueDate: "2026-02-24", updatedAt: "2026-02-09" },
  { id: "r3", period: "2025-12", tax: "SICORE", taxpayer: "Beta SRL", status: "presentada", dueDate: "2026-01-20", updatedAt: "2026-01-18" },
  { id: "r4", period: "2026-01", tax: "Autónomos", taxpayer: "Juan Pérez", status: "vencida", dueDate: "2026-02-05", updatedAt: "2026-02-07" },
];

export default function ImpuestosPage() {
  const today = new Date();
  const [monthCursor, setMonthCursor] = useState<Date>(startOfMonth(today));
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | DJJJ["status"]>("todos");

  const deadlines = mockDeadlines;
  const ddjj = mockDDJJ;

  const monthStart = useMemo(() => startOfMonth(monthCursor), [monthCursor]);
  const monthEnd = useMemo(() => endOfMonth(monthCursor), [monthCursor]);

  const deadlinesByDate = useMemo(() => {
    const map = new Map<string, Deadline[]>();
    for (const d of deadlines) {
      const key = d.date;
      map.set(key, [...(map.get(key) ?? []), d]);
    }
    return map;
  }, [deadlines]);

  const upcoming = useMemo(() => {
    const nowISO = toDateOnlyISO(today);
    return [...deadlines]
      .filter(d => d.date >= nowISO)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8);
  }, [deadlines]);

  const ddjjFiltered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return ddjj
      .filter(r => (statusFilter === "todos" ? true : r.status === statusFilter))
      .filter(r => {
        if (!qq) return true;
        return (
          r.tax.toLowerCase().includes(qq) ||
          r.taxpayer.toLowerCase().includes(qq) ||
          r.period.toLowerCase().includes(qq)
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [ddjj, q, statusFilter]);

  // Construcción de grilla del mes
  const days = useMemo(() => {
    const start = monthStart;
    const end = monthEnd;

    const firstWeekday = weekdayIndexMondayFirst(start);
    const totalDays = end.getDate();

    const cells: Array<{ date: Date | null; iso?: string; inMonth?: boolean }> = [];

    // padding anterior
    for (let i = 0; i < firstWeekday; i++) cells.push({ date: null });

    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(start.getFullYear(), start.getMonth(), day);
      const iso = toDateOnlyISO(d);
      cells.push({ date: d, iso, inMonth: true });
    }

    // completar filas a múltiplo de 7
    while (cells.length % 7 !== 0) cells.push({ date: null });

    return cells;
  }, [monthStart, monthEnd]);

  const monthTitle = useMemo(() => {
    const fmt = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" });
    // Capitalize
    const t = fmt.format(monthCursor);
    return t.charAt(0).toUpperCase() + t.slice(1);
  }, [monthCursor]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-300">Impuestos</h1>
            <p className="text-blue-100/80 mt-1">
              Acceso rápido a vencimientos y DDJJ. (Calendario + seguimiento)
            </p>
          </div>           
          <div className="flex gap-2">
            <button
              onClick={() => alert("TODO: abrir modal 'Nueva DDJJ'")}
              className="rounded-xl bg-blue-500 hover:bg-blue-400 text-black font-bold px-4 py-2 transition"
            >
              + Nueva DDJJ
            </button>
            <button
              onClick={() => alert("TODO: abrir modal 'Nuevo vencimiento'")}
              className="rounded-xl bg-black/60 hover:bg-black/40 border border-blue-500/40 px-4 py-2 transition"
            >
              + Vencimiento
            </button>
            <button
                onClick={() => (window.location.href = "/dashboard")}
                className="rounded-xl bg-black/60 hover:bg-black/40 border border-blue-500/40 px-4 py-2 transition"
            >
                ← Volver al dashboard
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario */}
          <section className="lg:col-span-2 bg-black/60 border border-blue-500/30 rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-blue-200">Calendario</h2>
                <p className="text-sm text-blue-100/70">Marcados los días con vencimientos</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMonthCursor(addMonths(monthCursor, -1))}
                  className="rounded-xl bg-black/50 hover:bg-black/30 border border-blue-500/30 px-3 py-2"
                  aria-label="Mes anterior"
                >
                  ◀
                </button>
                <div className="text-blue-100 font-semibold min-w-[170px] text-center">
                  {monthTitle}
                </div>
                <button
                  onClick={() => setMonthCursor(addMonths(monthCursor, 1))}
                  className="rounded-xl bg-black/50 hover:bg-black/30 border border-blue-500/30 px-3 py-2"
                  aria-label="Mes siguiente"
                >
                  ▶
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-blue-100/80">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="text-center font-semibold">
                  {dayLabel(i)}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {days.map((cell, idx) => {
                if (!cell.date) {
                  return <div key={idx} className="h-20 rounded-xl bg-white/5" />;
                }

                const iso = cell.iso!;
                const isToday = iso === toDateOnlyISO(today);
                const hasDeadlines = (deadlinesByDate.get(iso)?.length ?? 0) > 0;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      const items = deadlinesByDate.get(iso) ?? [];
                      alert(
                        items.length
                          ? `Vencimientos (${iso}):\n- ${items.map(x => `${x.title} (${x.taxpayer})`).join("\n- ")}`
                          : `Sin vencimientos: ${iso}`
                      );
                    }}
                    className={cn(
                      "h-20 rounded-xl p-2 text-left border transition",
                      "bg-white/5 hover:bg-white/10 border-blue-500/20",
                      isToday && "border-blue-400 bg-blue-500/15",
                      hasDeadlines && "ring-1 ring-blue-400/60"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-sm font-bold text-blue-50">{cell.date.getDate()}</div>
                      {hasDeadlines && (
                        <span className="text-[11px] rounded-full px-2 py-0.5 bg-blue-500/20 border border-blue-400/40 text-blue-100">
                          {deadlinesByDate.get(iso)!.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-[11px] text-blue-100/70 line-clamp-2">
                      {hasDeadlines
                        ? (deadlinesByDate.get(iso) ?? [])
                            .slice(0, 2)
                            .map(x => x.title)
                            .join(" · ")
                        : "—"}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Próximos vencimientos */}
          <aside className="bg-black/60 border border-blue-500/30 rounded-2xl p-4 sm:p-6 shadow-lg">
            <h2 className="text-xl font-bold text-blue-200">Próximos vencimientos</h2>
            <p className="text-sm text-blue-100/70">Vista rápida (ordenado por fecha)</p>

            <div className="mt-4 space-y-3">
              {upcoming.map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl border border-blue-500/20 bg-white/5 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-blue-50">{d.title}</div>
                      <div className="text-xs text-blue-100/70">{d.taxpayer}</div>
                    </div>
                    <div className="text-xs font-semibold text-blue-100">{d.date}</div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span
                      className={cn(
                        "text-[11px] rounded-full px-2 py-0.5 border",
                        d.priority === "alta" && "bg-rose-500/15 border-rose-400/40 text-rose-200",
                        d.priority === "media" && "bg-amber-500/15 border-amber-400/40 text-amber-200",
                        d.priority === "baja" && "bg-emerald-500/15 border-emerald-400/40 text-emerald-200"
                      )}
                    >
                      Prioridad: {d.priority ?? "media"}
                    </span>
                    <button
                      onClick={() => alert(`TODO: ir al detalle del vencimiento ${d.id}`)}
                      className="text-[11px] rounded-full px-2 py-0.5 bg-black/40 border border-blue-500/20 hover:bg-black/20"
                    >
                      Ver
                    </button>
                  </div>
                </div>
              ))}

              {!upcoming.length && (
                <div className="text-sm text-blue-100/70">No hay vencimientos próximos.</div>
              )}
            </div>
          </aside>
        </div>

        {/* DDJJ */}
        <section className="mt-6 bg-black/60 border border-blue-500/30 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-blue-200">DDJJ</h2>
              <p className="text-sm text-blue-100/70">Seguimiento por período, impuesto y estado</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar: cliente, impuesto, período…"
                className="w-full sm:w-72 rounded-xl bg-black/40 border border-blue-500/30 px-3 py-2 outline-none focus:border-blue-400"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-xl bg-black/40 border border-blue-500/30 px-3 py-2 outline-none focus:border-blue-400"
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En proceso</option>
                <option value="presentada">Presentada</option>
                <option value="vencida">Vencida</option>
              </select>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-blue-100/80">
                <tr className="border-b border-blue-500/20">
                  <th className="text-left py-3 pr-4">Cliente</th>
                  <th className="text-left py-3 pr-4">Impuesto</th>
                  <th className="text-left py-3 pr-4">Período</th>
                  <th className="text-left py-3 pr-4">Vencimiento</th>
                  <th className="text-left py-3 pr-4">Estado</th>
                  <th className="text-left py-3 pr-4">Actualizado</th>
                  <th className="text-right py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ddjjFiltered.map((r) => (
                  <tr key={r.id} className="border-b border-blue-500/10">
                    <td className="py-3 pr-4 text-blue-50">{r.taxpayer}</td>
                    <td className="py-3 pr-4 text-blue-50">{r.tax}</td>
                    <td className="py-3 pr-4 text-blue-100/90">{r.period}</td>
                    <td className="py-3 pr-4 text-blue-100/90">{r.dueDate}</td>
                    <td className="py-3 pr-4">
                      <span className={statusPill(r.status)}>{r.status.replace("_", " ")}</span>
                    </td>
                    <td className="py-3 pr-4 text-blue-100/70">{r.updatedAt}</td>
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => alert(`TODO: abrir detalle DDJJ ${r.id}`)}
                          className="rounded-xl bg-black/40 border border-blue-500/20 hover:bg-black/20 px-3 py-1.5"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => alert(`TODO: cambiar estado DDJJ ${r.id}`)}
                          className="rounded-xl bg-blue-500/20 border border-blue-400/30 hover:bg-blue-500/30 px-3 py-1.5"
                        >
                          Estado
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!ddjjFiltered.length && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-blue-100/70">
                      No hay resultados con los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}