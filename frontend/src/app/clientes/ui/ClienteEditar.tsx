"use client";

import React, { useEffect, useState } from "react";

type ClienteEstado = "Activo" | "Inactivo";

type Cliente = {
  id: string;
  razonSocial: string;
  cuit?: string | null;
  email?: string | null;
  telefono?: string | null;
  estado: ClienteEstado;
  creadoEn?: string | null;
};

const baseUrl = () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function getCliente(id: string): Promise<Cliente> {
  const res = await fetch(`${baseUrl()}/clientes/${id}`, { cache: "no-store" });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Error cargando cliente (${res.status})`);
  return data;
}

async function patchCliente(
  id: string,
  payload: Partial<Pick<Cliente, "razonSocial" | "cuit" | "email" | "telefono" | "estado">>
): Promise<Cliente> {
  const res = await fetch(`${baseUrl()}/clientes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Error guardando (${res.status})`);
  return data;
}

export default function ClienteEditar({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    razonSocial: "",
    cuit: "",
    email: "",
    telefono: "",
    estado: "Activo" as ClienteEstado,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const c = await getCliente(id);
        if (!mounted) return;

        setForm({
          razonSocial: c.razonSocial ?? "",
          cuit: c.cuit ?? "",
          email: c.email ?? "",
          telefono: c.telefono ?? "",
          estado: c.estado ?? "Activo",
        });
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const canSave = form.razonSocial.trim().length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) {
      setError("razonSocial es obligatoria");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await patchCliente(id, {
        razonSocial: form.razonSocial.trim(),
        cuit: form.cuit.trim() || undefined,
        email: form.email.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        estado: form.estado,
      });

      setSuccess("Cambios guardados.");
      setTimeout(() => {
        window.location.href = `/clientes/${id}`;
      }, 350);
    } catch (e: any) {
      setError(e?.message ?? "Error guardando");
    } finally {
      setSaving(false);
    }
  };

  const onBack = () => (window.location.href = `/clientes/${id}`);

  if (loading) return <div className="min-h-screen bg-black text-white p-8">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-200">Editar Cliente</h1>
            <p className="mt-1 text-sm text-blue-200/70">Actualizá los datos y guardá.</p>
          </div>

          <button
            onClick={onBack}
            disabled={saving}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
          >
            ← Volver
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur">
          {(error || success) && (
            <div className="mb-4">
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {success}
                </div>
              )}
            </div>
          )}

          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Razón Social *"
              value={form.razonSocial}
              onChange={(v) => setForm((p) => ({ ...p, razonSocial: v }))}
              placeholder="Ej: Code Assurance"
            />

            <label className="block">
              <div className="text-xs text-blue-200/70">Estado</div>
              <select
                value={form.estado}
                onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value as ClienteEstado }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-blue-500/60"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </label>

            <Field
              label="CUIT"
              value={form.cuit}
              onChange={(v) => setForm((p) => ({ ...p, cuit: v }))}
              placeholder="20-12345678-9"
            />
            <Field
              label="Email"
              value={form.email}
              onChange={(v) => setForm((p) => ({ ...p, email: v }))}
              placeholder="demo@demo.com"
              type="email"
            />
            <Field
              label="Teléfono"
              value={form.telefono}
              onChange={(v) => setForm((p) => ({ ...p, telefono: v }))}
              placeholder="+54 9 351..."
            />

            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving || !canSave}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold shadow hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>

            <div className="md:col-span-2 text-xs text-blue-200/60">
              * Campo obligatorio: Razón Social
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs text-blue-200/70">{props.label}</div>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        type={props.type ?? "text"}
        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-blue-500/60"
      />
    </label>
  );
}