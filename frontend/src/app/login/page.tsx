"use client";

import React, { useState } from "react";
import { login } from "./auth";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login({ email, password });
      if (!result.ok) {
        setError(result.error || "Usuario no encontrado");
      } else {
        // Aquí puedes guardar el token si lo necesitas: localStorage.setItem('token', result.token)
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-black">
      <h1 className="text-4xl font-extrabold text-blue-500 mb-8 text-center">Estudio Contable</h1>
      <div className="bg-black bg-opacity-80 rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center">Iniciar sesión</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-blue-200">Email</label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md bg-blue-950 border border-blue-700 text-blue-100 focus:ring-blue-400 focus:border-blue-400 p-3"
              placeholder="tu@email.com"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-blue-200">Contraseña</label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full rounded-md bg-blue-950 border border-blue-700 text-blue-100 focus:ring-blue-400 focus:border-blue-400 p-3"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-150"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a href="#" className="text-blue-300 hover:text-blue-400 text-sm">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
      <footer className="mt-8 text-center text-blue-300 text-sm">
        © 2026 Code Assurance. Todos los derechos reservados.
      </footer>
    </div>
  );
}
