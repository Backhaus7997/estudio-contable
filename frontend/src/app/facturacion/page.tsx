export default function FacturacionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-black p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header + volver */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-400">Facturación</h1>
            <p className="mt-2 text-blue-100/80">
              Acciones rápidas para emitir y gestionar comprobantes.
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-xl border border-blue-200/25 bg-black/60 px-4 py-2 text-sm font-semibold text-blue-200 shadow-lg transition hover:bg-black/70 hover:border-blue-200/40 hover:text-blue-100"
          >
            ← Volver al dashboard
          </a>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickCard
            title="Nueva factura"
            description="Crear un comprobante (borrador) y cargar items."
            href="/facturacion/nueva"
          />
          <QuickCard
            title="Comprobantes"
            description="Buscar, filtrar y ver el historial."
            href="/facturacion/comprobantes"
          />
          <QuickCard
            title="Clientes"
            description="Ir a clientes para seleccionar o crear uno."
            href="/clientes"
          />
          <QuickCard
            title="Productos / Servicios"
            description="Catálogo para reutilizar ítems en facturas."
            href="/facturacion/items"
          />
          <QuickCard
            title="Configuración"
            description="Punto de venta, numeración, datos del emisor."
            href="/facturacion/configuracion"
          />
          <QuickCard
            title="Reportes"
            description="Totales por período (placeholder)."
            href="/facturacion/reportes"
          />
        </div>
      </div>
    </div>
  );
}

function QuickCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-2xl border border-blue-200/20 bg-black/60 p-5 shadow-lg transition hover:bg-black/70 hover:border-blue-200/35"
    >
      <div className="text-lg font-semibold text-blue-200 group-hover:text-blue-100">
        {title}
      </div>
      <div className="mt-2 text-sm text-blue-100/70">{description}</div>
      <div className="mt-4 text-sm font-semibold text-blue-400 group-hover:text-blue-300">
        Abrir →
      </div>
    </a>
  );
}