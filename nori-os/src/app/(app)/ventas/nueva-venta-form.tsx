"use client";

import { useState, useTransition } from "react";
import { createSale } from "@/lib/nori/actions";

type Channel = { id: string; name: string };

const inputCls =
  "rounded-lg border border-white/[0.08] bg-nori-input px-3 py-2 text-[12.5px] text-nori-text outline-none placeholder:text-nori-text-dim";

export function NuevaVentaForm({ channels, products }: { channels: Channel[]; products: string[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [clientName, setClientName] = useState("");
  const [productName, setProductName] = useState("");
  const [channelId, setChannelId] = useState(channels[0]?.id ?? "");
  const [units, setUnits] = useState("1");
  const [unitPrice, setUnitPrice] = useState("130");
  const [paymentMethod, setPaymentMethod] = useState<"tarjeta" | "efectivo" | "transferencia">("transferencia");
  const [status, setStatus] = useState<"pagado" | "pendiente">("pagado");

  if (channels.length === 0) {
    return (
      <div className="mb-4 rounded-[12px] border border-nori-border bg-nori-card p-4 text-[12.5px] text-nori-text-dim">
        No hay canales de venta configurados en la base de datos.
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => {
            setOpen(true);
            setDone(false);
          }}
          className="cursor-pointer rounded-[9px] border border-nori-terracota/25 bg-nori-terracota/10 px-4 py-2 text-[12.5px] text-nori-terracota"
        >
          + Registrar venta
        </button>
        {done ? <span className="text-[12px] text-nori-terracota">Venta registrada ✓</span> : null}
      </div>
    );
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await createSale({
          clientName,
          productName,
          channelId,
          units: parseFloat(units) || 0,
          unitPrice: parseFloat(unitPrice) || 0,
          paymentMethod,
          status,
        });
        setClientName("");
        setProductName("");
        setUnits("1");
        setDone(true);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo registrar la venta.");
      }
    });
  }

  return (
    <div className="mb-4 rounded-[14px] border border-nori-border bg-nori-card p-4">
      <div className="mb-3 text-[13px] font-semibold">Registrar venta</div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-[11px] text-nori-text-dim">
          Cliente
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nombre o negocio" className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-nori-text-dim">
          Producto
          <input
            list="nori-productos"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="ej. Vainilla"
            className={inputCls}
          />
          <datalist id="nori-productos">
            {products.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-nori-text-dim">
          Canal
          <select value={channelId} onChange={(e) => setChannelId(e.target.value)} className={inputCls}>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-nori-text-dim">
          Pintas
          <input type="number" min="1" step="1" value={units} onChange={(e) => setUnits(e.target.value)} className={`${inputCls} w-20 text-center font-mono`} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-nori-text-dim">
          Precio/unidad
          <input type="number" min="0" step="any" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} className={`${inputCls} w-24 text-center font-mono`} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-nori-text-dim">
          Pago
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)} className={inputCls}>
            <option value="transferencia">Transferencia</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-nori-text-dim">
          Estado
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputCls}>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </label>
        <button
          onClick={submit}
          disabled={isPending}
          className="rounded-lg bg-nori-terracota px-4 py-2 text-[12.5px] font-semibold text-nori-terracota-deep disabled:opacity-50"
        >
          {isPending ? "Guardando…" : "Guardar"}
        </button>
        <button onClick={() => setOpen(false)} className="px-2 py-2 text-[12.5px] text-nori-text-muted">
          Cancelar
        </button>
      </div>
      <div className="mt-2 text-[11.5px]">
        <span className="text-nori-text-dim">
          Total: <span className="font-mono text-nori-text-body">${((parseFloat(units) || 0) * (parseFloat(unitPrice) || 0)).toFixed(2)}</span>
        </span>
        {error ? <span className="ml-3 text-nori-red">{error}</span> : null}
      </div>
    </div>
  );
}
