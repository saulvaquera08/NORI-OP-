"use client";

import { useRef, useState, useTransition } from "react";
import { createProductionOrder } from "@/lib/nori/actions";

type RecipeOption = { id: string; label: string };

export function NuevaOrdenForm({ recipeOptions }: { recipeOptions: RecipeOption[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createProductionOrder({
          recipeVersionId: String(formData.get("recipeVersionId") ?? ""),
          operator: String(formData.get("operator") ?? ""),
          lotCode: String(formData.get("lotCode") ?? ""),
          temperatureC: formData.get("temperatureC") ? Number(formData.get("temperatureC")) : null,
          yieldUnits: Number(formData.get("yieldUnits") ?? 0),
          mermaPct: Number(formData.get("mermaPct") ?? 0),
          notes: String(formData.get("notes") ?? ""),
        });
        formRef.current?.reset();
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo crear la orden.");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-3 w-full cursor-pointer rounded-[9px] border border-nori-terracota/25 bg-nori-terracota/10 py-2 text-[12.5px] text-nori-terracota"
      >
        + Nueva orden
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="mb-4 flex flex-col gap-2 rounded-[11px] border border-nori-border bg-nori-card p-3"
    >
      <select
        name="recipeVersionId"
        required
        className="rounded-[6px] border border-white/[0.08] bg-nori-input px-2 py-[6px] text-[12px] text-nori-text"
      >
        {recipeOptions.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
      <input
        name="operator"
        required
        placeholder="Operador"
        className="rounded-[6px] border border-white/[0.08] bg-nori-input px-2 py-[6px] text-[12px] text-nori-text placeholder:text-nori-text-dim"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          name="lotCode"
          placeholder="Lote (L-0000)"
          className="rounded-[6px] border border-white/[0.08] bg-nori-input px-2 py-[6px] text-[12px] text-nori-text placeholder:text-nori-text-dim"
        />
        <input
          name="temperatureC"
          type="number"
          placeholder="Temp °C"
          className="rounded-[6px] border border-white/[0.08] bg-nori-input px-2 py-[6px] text-[12px] text-nori-text placeholder:text-nori-text-dim"
        />
        <input
          name="yieldUnits"
          type="number"
          required
          placeholder="Rendimiento (vasos)"
          className="rounded-[6px] border border-white/[0.08] bg-nori-input px-2 py-[6px] text-[12px] text-nori-text placeholder:text-nori-text-dim"
        />
        <input
          name="mermaPct"
          type="number"
          step="0.1"
          placeholder="Merma %"
          className="rounded-[6px] border border-white/[0.08] bg-nori-input px-2 py-[6px] text-[12px] text-nori-text placeholder:text-nori-text-dim"
        />
      </div>
      <textarea
        name="notes"
        placeholder="Observaciones"
        rows={2}
        className="resize-none rounded-[6px] border border-white/[0.08] bg-nori-input px-2 py-[6px] text-[12px] text-nori-text placeholder:text-nori-text-dim"
      />
      {error && <div className="text-[11px] text-nori-red">{error}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-[7px] bg-nori-terracota py-[7px] text-[12px] font-semibold text-nori-terracota-deep disabled:opacity-60"
        >
          {isPending ? "Creando…" : "Crear orden"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-[7px] px-3 py-[7px] text-[12px] text-nori-text-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
