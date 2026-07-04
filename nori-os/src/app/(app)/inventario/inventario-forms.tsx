"use client";

import { useState, useTransition } from "react";
import { registerInventoryMovement, setStockCount, updateStockMin } from "@/lib/nori/actions";

type IngredientOption = { id: string; name: string; unit: string; stock: number; stockMin: number };

const inputCls =
  "rounded-lg border border-white/[0.08] bg-nori-input px-3 py-2 text-[12.5px] text-nori-text outline-none placeholder:text-nori-text-dim";

export function InventarioForms({ ingredients }: { ingredients: IngredientOption[] }) {
  const [ingredientId, setIngredientId] = useState(ingredients[0]?.id ?? "");
  const [mode, setMode] = useState<"entrada" | "salida" | "conteo" | "minimo">("conteo");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selected = ingredients.find((i) => i.id === ingredientId);
  if (ingredients.length === 0) return null;

  const modeLabel: Record<string, string> = {
    conteo: "Conteo físico (fijar stock actual)",
    entrada: "Entrada (compra / recepción)",
    salida: "Salida manual",
    minimo: "Fijar stock mínimo (alertas)",
  };

  function submit() {
    const qty = parseFloat(quantity);
    setError(null);
    setDone(null);
    if (!ingredientId) return setError("Elige un ingrediente.");
    if (!Number.isFinite(qty) || qty < 0) return setError("Cantidad inválida.");
    if ((mode === "entrada" || mode === "salida") && qty <= 0)
      return setError("La cantidad debe ser mayor a cero.");

    startTransition(async () => {
      try {
        if (mode === "conteo") await setStockCount({ ingredientId, newStock: qty, note });
        else if (mode === "minimo") await updateStockMin(ingredientId, qty);
        else await registerInventoryMovement({ ingredientId, type: mode, quantity: qty, note });
        setQuantity("");
        setNote("");
        setDone("Registrado ✓");
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo registrar.");
      }
    });
  }

  return (
    <div className="mb-5 rounded-[14px] border border-nori-border bg-nori-card p-4">
      <div className="mb-3 text-[13px] font-semibold">Registrar en inventario</div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-[11px] text-nori-text-dim">
          Ingrediente
          <select value={ingredientId} onChange={(e) => setIngredientId(e.target.value)} className={inputCls}>
            {ingredients.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-nori-text-dim">
          Acción
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as typeof mode)}
            className={inputCls}
          >
            {Object.entries(modeLabel).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-nori-text-dim">
          {mode === "conteo" ? "Stock contado" : mode === "minimo" ? "Nuevo mínimo" : "Cantidad"}
          {selected ? ` (${selected.unit})` : ""}
          <input
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className={`${inputCls} w-28 text-center font-mono`}
          />
        </label>
        {mode !== "minimo" ? (
          <label className="flex min-w-40 flex-1 flex-col gap-1 text-[11px] text-nori-text-dim">
            Nota (opcional)
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ej. compra Costco, merma por derrame…"
              className={inputCls}
            />
          </label>
        ) : null}
        <button
          onClick={submit}
          disabled={isPending}
          className="rounded-lg bg-nori-terracota px-4 py-2 text-[12.5px] font-semibold text-nori-terracota-deep disabled:opacity-50"
        >
          {isPending ? "Guardando…" : "Registrar"}
        </button>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[11.5px]">
        {selected ? (
          <span className="text-nori-text-dim">
            Stock actual: <span className="font-mono text-nori-text-body">{selected.stock} {selected.unit}</span> ·
            mínimo: <span className="font-mono text-nori-text-body">{selected.stockMin} {selected.unit}</span>
          </span>
        ) : null}
        {error ? <span className="text-nori-red">{error}</span> : null}
        {done ? <span className="text-nori-terracota">{done}</span> : null}
      </div>
    </div>
  );
}
