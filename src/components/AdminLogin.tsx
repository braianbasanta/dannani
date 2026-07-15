"use client";

import { useState } from "react";

export function AdminLogin({ notConfigured }: { notConfigured?: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "Clave incorrecta.");
        setBusy(false);
      }
    } catch {
      setError("No se pudo conectar. Inténtalo de nuevo.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-night px-4 text-cream">
      <div className="w-full max-w-sm rounded-[1.5rem] bg-night-soft p-8 shadow-card ring-1 ring-cream/10">
        <p className="eyebrow">Da Nanni</p>
        <h1 className="mt-2 font-display text-2xl">Panel de reservas</h1>
        {notConfigured ? (
          <p className="mt-4 rounded-xl bg-mustard/15 px-4 py-3 text-sm text-mustard">
            El panel no está configurado todavía: falta definir{" "}
            <code>ADMIN_PASSWORD</code> en el entorno.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-pw"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-cream/60"
              >
                Clave de acceso
              </label>
              <input
                id="admin-pw"
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl bg-cream/[0.04] px-4 py-3 text-sm text-cream ring-1 ring-cream/15 outline-none focus:ring-electric"
              />
            </div>
            {error && <p className="text-sm text-mustard">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-electric px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-night transition hover:bg-electric-dark disabled:opacity-60"
            >
              {busy ? "Entrando…" : "Entrar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
