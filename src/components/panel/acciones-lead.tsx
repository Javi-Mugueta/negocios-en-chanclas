"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ESTADOS, ETIQUETA_ESTADO, type EstadoLead } from "@/lib/etiquetas";
import type { Lead } from "@/lib/leads";

export function AccionesLead({ lead, csrf }: { lead: Lead; csrf: string }) {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoLead>(lead.estado);
  const [notas, setNotas] = useState(lead.notas ?? "");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  async function enviar(body: Record<string, unknown>) {
    setOcupado(true);
    setError(null);
    try {
      const res = await fetch(`/api/panel/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-nec-csrf": csrf },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "No se ha podido guardar.");
        return;
      }
      if (typeof body.estado === "string") setEstado(body.estado as EstadoLead);
      if ("notas" in body) setNotas(typeof body.notas === "string" ? body.notas : "");
      setConfirmar(false);
      router.refresh();
    } catch {
      setError("No se ha podido guardar.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="space-y-5">
      <label className="block space-y-2 text-sm font-semibold">
        Estado
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoLead)}
          className="h-11 w-full rounded-2xl border border-tinta/15 bg-white px-3 font-normal outline-none focus-visible:border-chancla focus-visible:ring-3 focus-visible:ring-chancla/20"
        >
          {ESTADOS.map((opcion) => (
            <option key={opcion} value={opcion}>
              {ETIQUETA_ESTADO[opcion]}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        disabled={ocupado || estado === lead.estado}
        onClick={() => enviar({ estado })}
        className="h-11 w-full rounded-full bg-tinta text-sm font-semibold text-arena focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none disabled:opacity-50"
      >
        Guardar estado
      </button>

      <label className="block space-y-2 text-sm font-semibold">
        Notas internas
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={5}
          maxLength={8000}
          className="w-full rounded-2xl border border-tinta/15 bg-white px-3 py-2 font-normal outline-none focus-visible:border-chancla focus-visible:ring-3 focus-visible:ring-chancla/20"
        />
      </label>
      <button
        type="button"
        disabled={ocupado || notas === (lead.notas ?? "")}
        onClick={() => enviar({ notas })}
        className="h-11 w-full rounded-full bg-chancla text-sm font-semibold text-white focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none disabled:opacity-50"
      >
        Guardar notas
      </button>

      <div className="flex flex-col gap-2 border-t border-tinta/10 pt-4">
        {lead.estado !== "spam" && (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => enviar({ estado: "spam" })}
            className="h-10 rounded-full text-sm font-semibold text-destructive ring-1 ring-destructive/30 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
          >
            Marcar como spam
          </button>
        )}
        {lead.borradoEn ? (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => enviar({ restaurar: true })}
            className="h-10 rounded-full text-sm font-semibold ring-1 ring-tinta/15 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
          >
            Restaurar
          </button>
        ) : confirmar ? (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => enviar({ borrar: true })}
            className="h-10 rounded-full bg-destructive text-sm font-semibold text-white focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
          >
            Confirmar borrado
          </button>
        ) : (
          <button
            type="button"
            disabled={ocupado}
            onClick={() => setConfirmar(true)}
            className="h-10 rounded-full text-sm font-semibold ring-1 ring-tinta/15 focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none"
          >
            Marcar como borrada
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
