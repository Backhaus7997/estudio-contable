"use client";

import React, { useMemo, useState } from "react";

type NewClientPayload = {
  razonSocial: string;   // ✅ obligatorio
  firstName: string;
  lastName: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
};

export default function NuevoClientePage() {
  const baseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
    []
  );

    const [form, setForm] = useState<NewClientPayload>({
    razonSocial: "",
    firstName: "",
    lastName: "",
    taxId: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

const canSubmit = useMemo(() => {
  return (
    form.razonSocial.trim().length > 1 &&
    form.firstName.trim().length > 1 &&
    form.lastName.trim().length > 1
  );
}, [form.razonSocial, form.firstName, form.lastName]);
  const onChange =
    (key: keyof NewClientPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const goBack = () => {
    // Ajustá a la ruta real de tu listado de clientes si es otra
    window.location.href = "/clientes";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!canSubmit) {
      setError("Completá al menos Razón Social, Nombre y Apellido.");
      return;
    }

    setLoading(true);
    try {
      const payload: NewClientPayload = {
        razonSocial: form.razonSocial.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        taxId: form.taxId?.trim() || undefined,
        email: form.email?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        address: form.address?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      };

      // ✅ Endpoint sugerido. Si tu backend usa otra ruta, cambiala acá.
      const res = await fetch(`${baseUrl}/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          (data && (data.message || data.error)) ||
          `Error al crear cliente (HTTP ${res.status})`;
        throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
      }

      setSuccess("Cliente creado correctamente.");
      // Redirección opcional: al listado o al detalle si el backend devuelve id
      // if (data?.id) window.location.href = `/clientes/${data.id}`;
      setTimeout(() => {
        window.location.href = "/clientes";
      }, 600);
    } catch (err: any) {
      setError(err?.message ?? "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-black px-4">
      <div className="w-full max-w-3xl">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-blue-500">
            Nuevo Cliente
          </h1>
          <p className="text-blue-100/80 mt-2">
            Cargá los datos principales del cliente y guardá.
          </p>
        </div>

        <div className="bg-black bg-opacity-80 rounded-xl shadow-xl border border-blue-500/20 p-6">
          {(error || success) && (
            <div className="mb-4">
              {error && (
                <div
                  data-testid="alert-error"
                  className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200"
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  data-testid="alert-success"
                  className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-emerald-200"
                >
                  {success}
                </div>
              )}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Razón Social *"
                value={form.razonSocial}
                onChange={onChange("razonSocial")}
                placeholder="Ej: Perez Juan (o Nombre de empresa)"
                testId="input-razonSocial"
              />
              <Field
                label="Nombre *"
                value={form.firstName}
                onChange={onChange("firstName")}
                placeholder="Ej: Juan"
                testId="input-firstName"
              />
              <Field
                label="Apellido *"
                value={form.lastName}
                onChange={onChange("lastName")}
                placeholder="Ej: Pérez"
                testId="input-lastName"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="CUIT/CUIL/DNI"
                value={form.taxId ?? ""}
                onChange={onChange("taxId")}
                placeholder="Ej: 20-12345678-9"
                testId="input-taxId"
              />
              <Field
                label="Email"
                value={form.email ?? ""}
                onChange={onChange("email")}
                placeholder="Ej: juan@correo.com"
                testId="input-email"
                type="email"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Teléfono"
                value={form.phone ?? ""}
                onChange={onChange("phone")}
                placeholder="Ej: +54 9 351 555-5555"
                testId="input-phone"
              />
              <Field
                label="Dirección"
                value={form.address ?? ""}
                onChange={onChange("address")}
                placeholder="Calle, número, ciudad"
                testId="input-address"
              />
            </div>

            <TextArea
              label="Notas"
              value={form.notes ?? ""}
              onChange={onChange("notes")}
              placeholder="Observaciones, referencias, etc."
              testId="input-notes"
            />

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={goBack}
                data-testid="btn-back"
                className="px-4 py-2 rounded-lg border border-blue-500/40 text-blue-100 hover:bg-blue-500/10 transition"
                disabled={loading}
              >
                Volver
              </button>

              <button
                type="submit"
                data-testid="btn-save"
                disabled={loading || !canSubmit}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition"
              >
                {loading ? "Guardando..." : "Guardar Cliente"}
              </button>
            </div>

            <p className="text-xs text-blue-100/60">
              * Campos obligatorios: Nombre y Apellido
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  testId: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-blue-100/80">{props.label}</span>
      <input
        data-testid={props.testId}
        className="mt-1 w-full rounded-lg bg-black/40 border border-blue-500/25 px-3 py-2 text-blue-50 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        type={props.type ?? "text"}
      />
    </label>
  );
}

function TextArea(props: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  testId: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-blue-100/80">{props.label}</span>
      <textarea
        data-testid={props.testId}
        className="mt-1 w-full min-h-[96px] rounded-lg bg-black/40 border border-blue-500/25 px-3 py-2 text-blue-50 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
      />
    </label>
  );
}