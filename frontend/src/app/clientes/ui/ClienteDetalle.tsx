"use client";

import React, { useEffect, useState } from "react";

type Cliente = {
  id: string;
  razonSocial: string;
  cuit?: string;
  email?: string;
  telefono?: string;
  estado: "Activo" | "Inactivo";
  creadoEn?: string;
};

const baseUrl = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function getCliente(id: string): Promise<Cliente> {
  const res = await fetch(`${baseUrl()}/clientes/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error cargando cliente (${res.status})`);
  return res.json();
}

export default function ClienteDetalle({ id }: { id: string }) {
  const [c, setC] = useState<Cliente | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        setC(await getCliente(id));
      } catch (e: any) {
        setError(e?.message ?? "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black text-white p-8">Cargando...</div>;
  if (error) return <div className="min-h-screen bg-black text-red-200 p-8">{error}</div>;
  if (!c) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-200">{c.razonSocial}</h1>
            <p className="mt-1 text-sm text-blue-200/70">Detalle del cliente</p>
          </div>
          <a
            href="/clientes"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            ← Volver
          </a>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Item label="CUIT" value={c.cuit ?? "—"} />
            <Item label="Estado" value={c.estado} />
            <Item label="Email" value={c.email ?? "—"} />
            <Item label="Teléfono" value={c.telefono ?? "—"} />
            <Item label="ID" value={c.id} />
            <Item label="Creado" value={c.creadoEn ?? "—"} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur">
          <p className="text-sm text-blue-200/70">
            Próximo: Legajo (documentos), notas y tareas del cliente.
          </p>
        </div>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-blue-200/70">{label}</div>
      <div className="mt-1 text-sm font-semibold text-blue-100 break-words">{value}</div>
    </div>
  );
}