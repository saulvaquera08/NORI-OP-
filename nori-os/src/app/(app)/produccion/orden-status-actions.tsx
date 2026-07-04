"use client";

import { useState, useTransition } from "react";
import { updateProductionOrderStatus } from "@/lib/nori/actions";

export function OrdenStatusActions({ orderId }: { orderId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function set(status: "completada" | "cancelada") {
    setError(null);
    startTransition(async () => {
      try {
        await updateProductionOrderStatus(orderId, status);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo actualizar.");
      }
    });
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <button
        onClick={() => set("completada")}
        disabled={isPending}
        className="rounded-lg bg-nori-terracota px-4 py-2 text-[12.5px] font-semibold text-nori-terracota-deep disabled:opacity-50"
      >
        ✓ Completar lote
      </button>
      <button
        onClick={() => set("cancelada")}
        disabled={isPending}
        className="rounded-lg border border-nori-red/30 bg-nori-red/10 px-4 py-2 text-[12.5px] text-nori-red disabled:opacity-50"
      >
        Cancelar
      </button>
      <span className="text-[11px] text-nori-text-dim">
        Los KPIs del dashboard cuentan solo lotes completados.
      </span>
      {error ? <span className="text-[12px] text-nori-red">{error}</span> : null}
    </div>
  );
}
