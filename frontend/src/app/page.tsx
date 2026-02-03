export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/health`, { cache: "no-store" });
  const data = await res.json();

  return (
    <main style={{ padding: 24 }}>
      <h1>Frontend OK</h1>
      <h2>Estudio contable de tute</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
