export async function listClientes(params?: { q?: string; estado?: "Activo" | "Inactivo" | "Todos" }) {
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  
  const u = new URL(`${baseUrl}/clientes`);
  if (params?.q?.trim()) u.searchParams.set("q", params.q.trim());
  if (params?.estado && params.estado !== "Todos") u.searchParams.set("estado", params.estado);

  const res = await fetch(u.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Error listando clientes (${res.status})`);
  return res.json();
}