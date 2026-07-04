import { createClient } from "@/lib/supabase/server";
import { getPrimaryFormuladorRecipe, toIngredientNutrition } from "@/lib/nori/data";
import { computeNomSeals, computeRecipeCalc } from "@/lib/nori/recipe-calc";
import { PrintButton } from "@/app/(app)/nutrimental/print-button";
import type { IngredientRow } from "@/lib/supabase/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupRequired } from "@/components/nori/setup-required";
import { EmptyState } from "@/components/nori/empty-state";

export const dynamic = "force-dynamic";
const SEAL_STYLES: Record<string, string> = {
  ok: "bg-nori-terracota/10 text-nori-terracota border-nori-terracota/25",
  warning: "bg-nori-amber/10 text-nori-amber border-nori-amber/25",
  exceso: "bg-nori-red/10 text-nori-red border-nori-red/25",
};
const SEAL_ICON: Record<string, string> = { ok: "✓", warning: "△", exceso: "✕" };

export default async function NutrimentalPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const supabase = await createClient();

  const primary = await getPrimaryFormuladorRecipe(supabase);
  if (!primary) {
    return (
      <EmptyState
        title="Sin receta para calcular la tabla nutrimental"
        description="La tabla nutrimental se genera automáticamente desde una receta del formulador. Cuando exista al menos una receta con versiones e ingredientes del catálogo, aquí verás la etiqueta por 100 g y por vaso, con la validación de sellos NOM-051."
        hint="Siguiente paso: capturar el catálogo real de ingredientes (T-004 del backlog)."
      />
    );
  }
  const { versions } = primary;
  const vigente = versions.find((v) => v.status === "vigente") ?? versions[0];

  const { data: allRows, error } = await supabase
    .from("recipe_version_ingredients")
    .select("recipe_version_id, grams, ingredient:ingredients(*)")
    .in(
      "recipe_version_id",
      versions.map((v) => v.id)
    );
  if (error) throw error;

  const rowsByVersion = new Map<string, { grams: number; ingredient: ReturnType<typeof toIngredientNutrition> }[]>();
  for (const r of allRows ?? []) {
    if (!r.ingredient) continue;
    const list = rowsByVersion.get(r.recipe_version_id) ?? [];
    list.push({ grams: Number(r.grams), ingredient: toIngredientNutrition(r.ingredient as unknown as IngredientRow) });
    rowsByVersion.set(r.recipe_version_id, list);
  }

  const vigenteRows = rowsByVersion.get(vigente.id) ?? [];
  const servingMl = Number(vigente.serving_size_ml) || 475;
  const calc = computeRecipeCalc(vigenteRows, Number(vigente.sell_price), servingMl);
  const seals = computeNomSeals(calc);

  const nutriRows = [
    { label: "Grasas", per100: calc.per100g(calc.totals.fat), perVaso: calc.fatVaso, unit: "g" },
    { label: "Carbohidratos", per100: calc.per100g(calc.totals.carbs), perVaso: calc.carbsVaso, unit: "g" },
    ...(calc.totals.carbs - calc.totals.metabCarbs > 0.05
      ? [{
          label: "  de los cuales no metabolizables",
          per100: calc.per100g(calc.totals.carbs - calc.totals.metabCarbs),
          perVaso: (calc.totals.carbs - calc.totals.metabCarbs) / calc.vasos,
          unit: "g",
        }]
      : []),
    { label: "Azúcares", per100: calc.per100g(calc.totals.sugar), perVaso: calc.sugarVaso, unit: "g" },
    { label: "Fibra dietética", per100: calc.per100g(calc.totals.fiber), perVaso: calc.fiberVaso, unit: "g" },
    { label: "Proteína", per100: calc.per100g(calc.totals.protein), perVaso: calc.proteinVaso, unit: "g" },
    { label: "Sodio", per100: calc.per100g(calc.totals.sodium), perVaso: calc.sodiumVaso, unit: "mg" },
  ];

  const versionCompare = versions
    .slice()
    .sort((a, b) => a.version_number - b.version_number)
    .map((v) => {
      const rows = rowsByVersion.get(v.id) ?? [];
      const c = computeRecipeCalc(rows, Number(v.sell_price), Number(v.serving_size_ml) || 475);
      return { label: `V${v.version_number}`, protein: c.proteinVaso };
    });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-7 lg:flex-row">
      <div className="w-full max-w-[380px] flex-none rounded-[14px] bg-white px-[26px] py-[22px] font-sans text-[#15181C]">
        <div className="mb-[6px] border-b-[8px] border-[#15181C] pb-[6px] text-base font-extrabold">
          Información Nutrimental
        </div>
        <div className="mb-[10px] text-[11px] text-[#444]">
          Tamaño de la porción: 1 pinta ({servingMl} mL) — Porciones por envase: 1
        </div>
        <div className="mb-1 flex justify-between border-b border-[#15181C] pb-1 text-[11px] text-[#444]">
          <span>Por 100 g</span>
          <span>Por porción</span>
        </div>
        <div className="mb-[6px] border-b-[6px] border-[#15181C] pb-[6px]">
          <div className="flex items-baseline justify-between gap-3 text-sm font-bold leading-[1.3]">
            <span className="whitespace-nowrap">Energía</span>
            <span className="flex-none whitespace-nowrap">
              {Math.round(calc.kcalPer100g)} / {Math.round(calc.caloriesVaso)} kcal
            </span>
          </div>
        </div>
        {nutriRows.map((n) => (
          <div
            key={n.label}
            className="flex items-baseline justify-between gap-3 border-b border-[#ddd] py-[5px] text-xs leading-[1.4]"
          >
            <span className="whitespace-nowrap">{n.label}</span>
            <span className="flex-none whitespace-nowrap">
              {n.per100.toFixed(n.unit === "mg" ? 0 : 1)}
              {n.unit} / {n.perVaso.toFixed(n.unit === "mg" ? 0 : 1)}
              {n.unit}
            </span>
          </div>
        ))}
        <div className="mt-[10px] text-[9.5px] leading-[1.4] text-[#666]">
          % Valores Diarios basados en una dieta de 2000 kcal. Cálculo generado automáticamente — validar
          antes de imprimir en empaque (NOM-051).
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex gap-[10px]">
          <button
            disabled
            title="Próximamente"
            className="cursor-not-allowed rounded-[9px] border border-white/10 bg-nori-card px-4 py-[9px] text-[12.5px] opacity-60"
          >
            Exportar PNG
          </button>
          <button
            disabled
            title="Próximamente"
            className="cursor-not-allowed rounded-[9px] border border-white/10 bg-nori-card px-4 py-[9px] text-[12.5px] opacity-60"
          >
            Exportar PDF
          </button>
          <PrintButton />
        </div>

        <div className="rounded-[14px] border border-nori-border bg-nori-card p-5">
          <div className="mb-[14px] text-[13px] font-semibold">Validación de sellos NOM-051</div>
          <div className="mb-3 flex flex-wrap gap-[10px]">
            {seals.map((s) => (
              <span
                key={s.label}
                className={`rounded-full border px-3 py-[6px] text-xs ${SEAL_STYLES[s.status]}`}
              >
                {SEAL_ICON[s.status]} {s.label}
              </span>
            ))}
          </div>
          <div className="text-xs leading-relaxed text-nori-text-muted">
            Cálculo estimado a partir de la receta vigente (V{vigente.version_number}). Requiere validación de
            laboratorio antes de usarse en etiquetado final o producción a escala.
          </div>
        </div>

        <div className="rounded-[14px] border border-nori-border bg-nori-card p-5">
          <div className="mb-[14px] text-[13px] font-semibold">Comparar versiones</div>
          <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-4">
            {versionCompare.map((vc) => (
              <div key={vc.label} className="rounded-[9px] bg-nori-input p-3 text-center">
                <div className="mb-[6px] font-mono text-[11px] text-nori-text-dim">{vc.label}</div>
                <div className="text-base font-bold">{vc.protein.toFixed(1)}g</div>
                <div className="text-[10.5px] text-nori-text-muted">proteína</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
