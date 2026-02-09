// Simple fetch-based authentication utility
export async function login({ email, password }: { email: string; password: string }): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error("Credenciales inválidas");
  }
  return res.json();
}
