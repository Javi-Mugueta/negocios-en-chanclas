"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/panel/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: data.get("usuario"), clave: data.get("clave") }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "No se ha podido entrar.");
        setEnviando(false);
        return;
      }
      router.replace("/panel");
      router.refresh();
    } catch {
      setError("No se ha podido entrar. Inténtalo de nuevo.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block space-y-2 text-sm font-semibold">
        Usuario
        <input
          name="usuario"
          autoComplete="username"
          required
          className="h-12 w-full rounded-2xl border border-tinta/15 bg-white px-4 text-base font-normal outline-none focus-visible:border-chancla focus-visible:ring-3 focus-visible:ring-chancla/20"
        />
      </label>
      <label className="block space-y-2 text-sm font-semibold">
        Contraseña
        <input
          name="clave"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 w-full rounded-2xl border border-tinta/15 bg-white px-4 text-base font-normal outline-none focus-visible:border-chancla focus-visible:ring-3 focus-visible:ring-chancla/20"
        />
      </label>
      {error && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-chancla font-semibold text-white transition hover:bg-chancla-2 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none disabled:opacity-70"
      >
        {enviando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        Entrar
      </button>
    </form>
  );
}
