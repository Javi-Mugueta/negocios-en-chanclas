"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function CerrarSesion({ csrf }: { csrf: string }) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);

  async function salir() {
    setOcupado(true);
    try {
      await fetch("/api/panel/logout", {
        method: "POST",
        headers: { "x-nec-csrf": csrf },
      });
    } finally {
      router.replace("/panel/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={salir}
      disabled={ocupado}
      className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-tinta/70 ring-1 ring-tinta/15 transition hover:bg-white focus-visible:ring-4 focus-visible:ring-chancla/30 focus-visible:outline-none disabled:opacity-60"
    >
      <LogOut className="size-4" aria-hidden="true" />
      Salir
    </button>
  );
}
