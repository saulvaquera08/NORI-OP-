"use client";

import { useState, useTransition } from "react";
import { updateIngredientPrice } from "@/lib/nori/actions";

export function PrecioEditable({
  ingredientId,
  price,
  unit,
}: {
  ingredientId: string;
  price: number;
  unit: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(price));
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        title="Editar precio"
        className="font-mono text-[11px] text-nori-text-dim underline-offset-2 hover:text-nori-terracota hover:underline"
      >
        ${price}/{unit} ✎
      </button>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <input
        type="number"
        min="0"
        step="any"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 rounded-md border border-white/[0.08] bg-nori-input px-1 py-[2px] text-center font-mono text-[11px] text-nori-text outline-none"
      />
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              await updateIngredientPrice(ingredientId, parseFloat(value) || 0);
              setEditing(false);
            } catch {
              setEditing(false);
            }
          })
        }
        className="text-[11px] text-nori-terracota disabled:opacity-50"
      >
        ✓
      </button>
      <button onClick={() => setEditing(false)} className="text-[11px] text-nori-text-dim">
        ×
      </button>
    </span>
  );
}
