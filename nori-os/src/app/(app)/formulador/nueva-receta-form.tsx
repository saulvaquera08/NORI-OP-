"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRecipeWithVersion } from "@/lib/nori/actions";

export function NuevaRecetaForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-[9px] border border-nori-terracota/25 bg-nori-terracota/10 px-4 py-2 text-[12.5px] text-nori-terracota"
      >
        + Nueva receta
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre de la receta (ej. Cookies & Cream V1)"
        className="w-72 rounded-lg border border-white/[0.08] bg-nori-input px-3 py-2 text-[13px] text-nori-text outline-none placeholder:text-nori-text-dim"
      />
      <button
        disabled={isPending || !name.trim()}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const { recipeId } = await createRecipeWithVersion(name);
              setName("");
              setOpen(false);
              router.push(`/formulador?rec=${recipeId}`);
            } catch (e) {
              setError(e instanceof Error ? e.message : "No se pudo crear la receta.");
            }
          });
        }}
        className="rounded-lg bg-nori-terracota px-4 py-2 text-[12.5px] font-semibold text-nori-terracota-deep disabled:opacity-50"
      >
        {isPending ? "Creando…" : "Crear"}
      </button>
      <button onClick={() => setOpen(false)} className="px-2 py-2 text-[12.5px] text-nori-text-muted">
        Cancelar
      </button>
      {error ? <span className="text-[12px] text-nori-red">{error}</span> : null}
    </div>
  );
}
