export default async function MePage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  const res = await fetch(`${baseUrl}/me`, {
    cache: "no-store",
    // headers: { Authorization: "Bearer dev-token" }, // si luego lo exigís
  });

  const data = await res.json();

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>/me</h1>

      {!res.ok ? (
        <div style={{ color: "crimson" }}>
          Error HTTP {res.status}: {JSON.stringify(data)}
        </div>
      ) : null}

      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: 16,
          borderRadius: 12,
          overflow: "auto",
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}