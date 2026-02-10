"use client";

import React, { useEffect, useMemo, useState } from "react";

type Cliente = {
  id: string;
  razonSocial: string;
  cuit?: string;
  email?: string;
  telefono?: string;
  estado: "Activo" | "Inactivo";
  creadoEn?: string; // ISO
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-AR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

async function fetchClientes(): Promise<Cliente[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/clientes`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error cargando clientes (${res.status}). ${text || ""}`.trim());
  }

  return res.json();
}

export default function ClientesPage() {
  const [data, setData] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"Todos" | "Activo" | "Inactivo">("Todos");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const clientes = await fetchClientes();
        if (mounted) setData(clientes);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Error inesperado");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return data
      .filter((c) => (estado === "Todos" ? true : c.estado === estado))
      .filter((c) => {
        if (!query) return true;
        return (
          c.razonSocial.toLowerCase().includes(query) ||
          (c.cuit ?? "").toLowerCase().includes(query) ||
          (c.email ?? "").toLowerCase().includes(query)
        );
      });
  }, [data, q, estado]);

  const counts = useMemo(() => {
    const total = data.length;
    const activos = data.filter((c) => c.estado === "Activo").length;
    const inactivos = data.filter((c) => c.estado === "Inactivo").length;
    return { total, activos, inactivos };
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-blue-200">Clientes</h1>
            <p className="mt-1 text-sm text-blue-200/70">
              Gestioná tus clientes: alta, estado, contacto y acceso rápido a legajos.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold shadow hover:bg-blue-500 active:bg-blue-700"
              onClick={() => alert("TODO: abrir modal / navegar a /clientes/nuevo")}
            >
              + Nuevo cliente
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <StatCard title="Total" value={counts.total} />
          <StatCard title="Activos" value={counts.activos} />
          <StatCard title="Inactivos" value={counts.inactivos} />
        </div>

        {/* Controls */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <label className="text-xs text-blue-200/70">Buscar</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Razón social, CUIT o email…"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-blue-500/60"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-xs text-blue-200/70">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-blue-500/60"
              >
                <option value="Todos">Todos</option>
                <option value="Activo">Activos</option>
                <option value="Inactivo">Inactivos</option>
              </select>
            </div>

            <div className="md:col-span-2 md:flex md:justify-end">
              <button
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 active:bg-white/15 md:w-auto"
                onClick={() => {
                  setQ("");
                  setEstado("Todos");
                }}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur">
          {loading ? (
            <div className="p-6">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : error ? (
            <div className="p-6">
              <p className="text-sm text-red-200">{error}</p>
              <p className="mt-2 text-xs text-blue-200/60">
                Tip: asegurate de tener el backend levantado y el endpoint <code>/clientes</code> disponible.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              onCreate={() => alert("TODO: abrir modal / navegar a /clientes/nuevo")}
              hint={
                data.length === 0
                  ? "Todavía no hay clientes cargados."
                  : "No hay resultados con los filtros actuales."
              }
            />
          ) : (
            <ClientesTable rows={filtered} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur">
      <p className="text-xs text-blue-200/70">{title}</p>
      <p className="mt-1 text-2xl font-extrabold text-blue-100">{value}</p>
    </div>
  );
}

function Badge({ estado }: { estado: Cliente["estado"] }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
        estado === "Activo" ? "bg-emerald-500/15 text-emerald-200" : "bg-white/10 text-white/70"
      )}
    >
      {estado}
    </span>
  );
}

function ClientesTable({ rows }: { rows: Cliente[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 text-blue-200/70">
          <tr>
            <th className="px-4 py-3">Razón social</th>
            <th className="px-4 py-3">CUIT</th>
            <th className="px-4 py-3">Contacto</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Creado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="px-4 py-3">
                <div className="font-semibold text-blue-100">{c.razonSocial}</div>
                <div className="text-xs text-blue-200/60">ID: {c.id}</div>
              </td>
              <td className="px-4 py-3 text-white/80">{c.cuit ?? "—"}</td>
              <td className="px-4 py-3">
                <div className="text-white/80">{c.email ?? "—"}</div>
                <div className="text-xs text-white/60">{c.telefono ?? ""}</div>
              </td>
              <td className="px-4 py-3">
                <Badge estado={c.estado} />
              </td>
              <td className="px-4 py-3 text-white/80">{formatDate(c.creadoEn)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                    onClick={() => alert(`TODO: ver detalle ${c.id}`)}
                  >
                    Ver
                  </button>
                  <button
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                    onClick={() => alert(`TODO: editar ${c.id}`)}
                  >
                    Editar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between px-4 py-3 text-xs text-blue-200/60">
        <span>{rows.length} cliente(s)</span>
        <span className="text-white/40">MVP: paginación pendiente</span>
      </div>
    </div>
  );
}

function EmptyState({ onCreate, hint }: { onCreate: () => void; hint: string }) {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-lg font-bold text-blue-100">Sin clientes</p>
        <p className="mt-2 text-sm text-blue-200/70">{hint}</p>
        <button
          className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold shadow hover:bg-blue-500 active:bg-blue-700"
          onClick={onCreate}
        >
          + Crear primer cliente
        </button>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="h-4 w-1/3 rounded bg-white/10" />
      <div className="mt-2 h-3 w-1/4 rounded bg-white/10" />
    </div>
  );
}