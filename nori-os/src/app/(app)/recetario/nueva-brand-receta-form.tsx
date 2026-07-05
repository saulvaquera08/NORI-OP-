"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrandRecipe, type NewBrandRecipeInput } from "@/lib/nori/actions";

type IngRow = { name: string; quantity: string; function: string };

const EMPTY_ING: IngRow = { name: "", quantity: "", function: "" };
const EMPTY_NUTRITION: NewBrandRecipeInput["nutrition"] = {
  kcal: "",
  protein_g: "",
  fat_total_g: "",
  carbs_g: "",
  sugars_g: "",
  sodium_mg: "",
  serving_size_g: "",
};

const NUTRITION_FIELDS: { key: keyof NewBrandRecipeInput["nutrition"]; label: string; unit: string }[] = [
  { key: "serving_size_g", label: "Porción", unit: "g" },
  { key: "kcal", label: "Energía", unit: "kcal" },
  { key: "protein_g", label: "Proteína", unit: "g" },
  { key: "carbs_g", label: "Carbs", unit: "g" },
  { key: "sugars_g", label: "Azúcares", unit: "g" },
  { key: "fat_total_g", label: "Grasas", unit: "g" },
  { key: "sodium_mg", label: "Sodio", unit: "mg" },
];

const inputClass =
  "w-full rounded-lg border border-white/[0.08] bg-nori-input px-3 py-2 text-[13px] text-nori-text outline-none placeholder:text-nori-text-dim focus:border-nori-terracota/40";

export function NuevaBrandRecetaForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [machine, setMachine] = useState<NewBrandRecipeInput["machine"]>("");
  const [description, setDescription] = useState("");
  const [seasonal, setSeasonal] = useState(false);
  const [notes, setNotes] = useState("");
  const [ingredients, setIngredients] = useState<IngRow[]>([{ ...EMPTY_ING }]);
  const [nutrition, setNutrition] = useState({ ...EMPTY_NUTRITION });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function reset() {
    setName("");
    setMachine("");
    setDescription("");
    setSeasonal(false);
    setNotes("");
    setIngredients([{ ...EMPTY_ING }]);
    setNutrition({ ...EMPTY_NUTRITION });
    setError(null);
  }

  function close() {
    setOpen(false);
    reset();
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const { slug } = await createBrandRecipe({
          name,
          machine,
          description,
          seasonal,
          ingredients,
          nutrition,
          notes,
        });
        close();
        router.push(`/recetario?r=${slug}`);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo crear la receta.");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-[10px] bg-nori-terracota px-4 py-2 text-[12.5px] font-semibold text-nori-terracota-deep"
      >
        + Nueva receta
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm md:items-center md:p-6">
      <div className="nori-slide-in-right flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-nori-border bg-nori-bg md:max-w-2xl md:rounded-2xl">
        {/* encabezado */}
        <div className="flex items-center justify-between border-b border-nori-border px-5 py-4">
          <div>
            <div className="text-[15px] font-bold">Nueva receta de marca</div>
            <div className="text-[11px] text-nori-text-dim">
              Se guarda en el recetario oficial · valores estimados hasta el bromatológico
            </div>
          </div>
          <button
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[18px] text-nori-text-muted hover:bg-white/[0.05]"
          >
            ×
          </button>
        </div>

        {/* cuerpo */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            {/* básicos */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.4px] text-nori-text-dim">
                  Nombre *
                </label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Fresa Silvestre"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-[0.4px] text-nori-text-dim">
                    Máquina
                  </label>
                  <select
                    value={machine}
                    onChange={(e) => setMachine(e.target.value as NewBrandRecipeInput["machine"])}
                    className={inputClass}
                  >
                    <option value="">Sin especificar</option>
                    <option value="ninja_creami">Ninja Creami</option>
                    <option value="whynter_icm200ls">Whynter ICM-200LS</option>
                  </select>
                </div>
                <label className="flex items-end gap-2 pb-2 text-[13px] text-nori-text-body">
                  <input
                    type="checkbox"
                    checked={seasonal}
                    onChange={(e) => setSeasonal(e.target.checked)}
                    className="h-4 w-4 accent-nori-terracota"
                  />
                  Edición estacional
                </label>
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.4px] text-nori-text-dim">
                  Descripción
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descripción del sabor / concepto"
                  className={inputClass}
                />
              </div>
            </div>

            {/* ingredientes */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.4px] text-nori-text-dim">
                  Ingredientes
                </span>
                <button
                  onClick={() => setIngredients((r) => [...r, { ...EMPTY_ING }])}
                  className="text-[12px] text-nori-terracota"
                >
                  + Agregar fila
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={ing.name}
                      onChange={(e) =>
                        setIngredients((rows) =>
                          rows.map((r, j) => (j === i ? { ...r, name: e.target.value } : r))
                        )
                      }
                      placeholder="Ingrediente"
                      className={`${inputClass} flex-[2]`}
                    />
                    <input
                      value={ing.quantity}
                      onChange={(e) =>
                        setIngredients((rows) =>
                          rows.map((r, j) => (j === i ? { ...r, quantity: e.target.value } : r))
                        )
                      }
                      placeholder="200 g / al gusto"
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      onClick={() =>
                        setIngredients((rows) =>
                          rows.length === 1 ? [{ ...EMPTY_ING }] : rows.filter((_, j) => j !== i)
                        )
                      }
                      className="flex h-9 w-8 flex-none items-center justify-center rounded-lg text-[15px] text-nori-text-dim hover:text-nori-red"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* nutrición */}
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-[0.4px] text-nori-text-dim">
                Nutrición estimada por envase (opcional)
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {NUTRITION_FIELDS.map((f) => (
                  <div key={f.key} className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={nutrition[f.key]}
                      onChange={(e) => setNutrition((n) => ({ ...n, [f.key]: e.target.value }))}
                      placeholder={f.label}
                      className={`${inputClass} pr-9`}
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-nori-text-dim">
                      {f.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* notas */}
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.4px] text-nori-text-dim">
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Proceso, observaciones, ajustes pendientes…"
                className={`${inputClass} resize-none`}
              />
            </div>

            {error ? <div className="text-[12.5px] text-nori-red">{error}</div> : null}
          </div>
        </div>

        {/* pie */}
        <div className="flex items-center justify-end gap-2 border-t border-nori-border px-5 py-3">
          <button onClick={close} className="px-3 py-2 text-[13px] text-nori-text-muted">
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={isPending || !name.trim()}
            className="rounded-[10px] bg-nori-terracota px-5 py-2 text-[13px] font-semibold text-nori-terracota-deep disabled:opacity-50"
          >
            {isPending ? "Guardando…" : "Guardar receta"}
          </button>
        </div>
      </div>
    </div>
  );
}
