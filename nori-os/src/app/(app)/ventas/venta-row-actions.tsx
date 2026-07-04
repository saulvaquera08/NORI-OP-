"use client";

import { useState, useTransition } from "react";
import { deleteSale, setSaleStatus } from "@/lib/nori/actions";

export function VentaRowActions({
  saleId,
  status,
}: {
  saleId: string;
  status: "pagado" | "pendiente";
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <span className="flex items-center justify-end gap-2">
      <button
        disabled={isPending}
        title={status === "pagado" ? "Marcar pendiente" : "Marcar pagado"}
        onClick={() =>
          startTransition(async () => {
            await setSaleStatus(saleId, status === "pagado" ? "pendiente" : "pagado").catch(() => {});
          })
        }
        className="text-[11px] text-nori-text-dim hover:text-nori-terracota disabled:opacity-50"
      >
        ⇄
      </button>
      {confirming ? (
        <>
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await deleteSale(saleId).catch(() => {});
                setConfirming(false);
              })
            }
            className="text-[11px] text-nori-red disabled:opacity-50"
          >
            confirmar
          </button>
          <button onClick={() => setConfirming(false)} className="text-[11px] text-nori-text-dim">
            no
          </button>
        </>
      ) : (
        <button
          title="Eliminar venta (corrección de captura)"
          onClick={() => setConfirming(true)}
          className="text-[12px] text-nori-text-dim hover:text-nori-red"
        >
          ×
        </button>
      )}
    </span>
  );
}
