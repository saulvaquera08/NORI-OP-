import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBrandRecipeData } from "@/lib/nori/data";
import type { RecipeNutritionRow } from "@/lib/supabase/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupRequired } from "@/components/nori/setup-required";
import { EmptyState } from "@/components/nori/empty-state";

export const dynamic = "force-dynamic";

const MACHINE_LABEL: Record<string, string> = {
  ninja_creami: "Ninja Creami",
  whynter_icm200ls: "Whynter ICM-200LS",
};

const NUTRITION_FIELDS: { key: keyof RecipeNutritionRow & string; label: string; unit: string }[] = [
  { key: "kcal", label: "Energía", unit: "kcal" },
  { key: "protein_g", label: "Proteína", unit: "g" },
  { key: "fat_total_g", label: "Grasas totales", unit: "g" },
  { key: "fat_saturated_g", label: "Grasas saturadas", unit: "g" },
  { key: "fat_trans_g", label: "Grasas trans", unit: "g" },
  { key: "carbs_g", label: "Carbohidratos", unit: "g" },
  { key: "sugars_g", label: "Azúcares", unit: "g" },
  { key: "added_sugars_g", label: "Azúcares añadidos", unit: "g" },
  { key: "sodium_mg", label: "Sodio", unit: "mg" },
];

// numeric columns arrive as strings; Number() also drops trailing zeros ("35.20" → "35.2")
function formatQty(n: number | string) {
  return String(Number(n));
}

export default async function RecetarioPage({
  searchParams,
}: {
  searchParams: Promise<{ r?: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const { r } = await searchParams;
  const supabase = await createClient();

  const { recipes, rules } = await getBrandRecipeData(supabase);

  if (recipes.length === 0) {
    return (
      <EmptyState
        title="El recetario está vacío"
        description="Aquí viven las recetas oficiales de marca NORI: bases por máquina, variantes de sabor, proceso, nutrición estimada y validación de sellos NOM-051."
      />
    );
  }

  const selected = (r ? recipes.find((rec) => rec.slug === r) : null) ?? recipes[0];
  const nutrition = selected.nutrition;
  const processSteps = Array.isArray(selected.process_steps) ? selected.process_steps : [];

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Lista de recetas */}
      <div className="max-h-[45vh] w-full flex-none overflow-y-auto border-b border-nori-border p-[18px] md:max-h-none md:w-[300px] md:border-b-0 md:border-r">
        <div className="mb-3 text-[11px] uppercase tracking-[0.5px] text-nori-text-dim">
          Recetas de marca
        </div>
        {recipes.map((rec) => {
          const active = rec.id === selected.id;
          return (
            <Link
              key={rec.id}
              href={`/recetario?r=${rec.slug}`}
              className="mb-2 block rounded-[11px] p-[14px]"
              style={{
                background: active ? "rgba(201,131,79,0.06)" : "#1B1F25",
                border: `1px solid ${active ? "rgba(201,131,79,0.28)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <div className="mb-[6px] text-[13.5px] font-semibold">{rec.name}</div>
              <div className="flex flex-wrap gap-[6px]">
                {rec.machine ? (
                  <span className="rounded-full bg-white/[0.05] px-2 py-[2px] text-[10px] text-nori-text-muted">
                    {MACHINE_LABEL[rec.machine]}
                  </span>
                ) : null}
                {rec.version ? (
                  <span className="rounded-full bg-nori-terracota/10 px-2 py-[2px] font-mono text-[10px] text-nori-terracota">
                    {rec.version}
                  </span>
                ) : null}
                {rec.seasonal ? (
                  <span className="rounded-full bg-nori-glaciar/10 px-2 py-[2px] text-[10px] text-nori-glaciar">
                    estacional
                  </span>
                ) : null}
                {rec.base_recipe_id ? (
                  <span className="rounded-full bg-white/[0.05] px-2 py-[2px] text-[10px] text-nori-text-dim">
                    variante
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}

        <div className="mb-[10px] mt-6 text-[11px] uppercase tracking-[0.5px] text-nori-text-dim">
          Reglas de formulación
        </div>
        <ol className="flex flex-col gap-2">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="rounded-[9px] border border-nori-border bg-nori-card p-[10px] text-[11.5px] leading-relaxed"
            >
              <span className="font-semibold text-nori-text">{rule.rule}.</span>{" "}
              {rule.rationale ? <span className="text-nori-text-dim">{rule.rationale}</span> : null}
            </li>
          ))}
        </ol>
      </div>

      {/* Detalle */}
      <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-7">
        <div className="mb-1 flex flex-wrap items-center gap-[10px]">
          <span className="text-xl font-bold">{selected.name}</span>
          {selected.machine ? (
            <span className="rounded-full bg-white/[0.05] px-[11px] py-1 text-[11px] text-nori-text-muted">
              {MACHINE_LABEL[selected.machine]}
            </span>
          ) : null}
          {selected.seasonal ? (
            <span className="rounded-full bg-nori-glaciar/10 px-[11px] py-1 text-[11px] text-nori-glaciar">
              Edición especial / estacional
            </span>
          ) : null}
        </div>
        {selected.description ? (
          <p className="mb-3 max-w-2xl text-[13px] leading-relaxed text-nori-text-body">
            {selected.description}
          </p>
        ) : null}
        {selected.base ? (
          <div className="mb-3 text-[12.5px] text-nori-text-muted">
            Delta sobre{" "}
            <Link href={`/recetario?r=${selected.base.slug}`} className="text-nori-terracota underline-offset-2 hover:underline">
              {selected.base.name}
            </Link>{" "}
            — abajo se listan solo los cambios respecto a la base.
          </div>
        ) : null}

        {!selected.is_lab_verified ? (
          <div className="mb-5 max-w-2xl rounded-[10px] border border-nori-amber/25 bg-nori-amber/[0.06] px-4 py-3 text-[12.5px] leading-relaxed text-nori-amber">
            Valores estimados con tablas estándar de ingredientes — NO son análisis de laboratorio. El
            bromatológico es obligatorio antes de empaque comercial.
          </div>
        ) : null}

        <div className="grid max-w-4xl grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Ingredientes */}
          <div className="rounded-[14px] border border-nori-border bg-nori-card p-5">
            <div className="mb-[14px] text-[13px] font-semibold">
              {selected.base ? "Cambios vs. la base" : "Ingredientes (por pinta ~475 ml)"}
            </div>
            <div className="flex flex-col">
              {selected.ingredients.map((ing) => (
                <div
                  key={ing.id}
                  className="flex items-baseline justify-between gap-3 border-b border-white/[0.05] py-[9px] last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="text-[12.5px] text-nori-text-bright">{ing.ingredient_name}</div>
                    {ing.function ? (
                      <div className="text-[10.5px] text-nori-text-dim">{ing.function}</div>
                    ) : null}
                  </div>
                  <span className="flex-none whitespace-nowrap font-mono text-[11.5px] text-nori-text-body">
                    {ing.quantity_display ??
                      (ing.quantity_g !== null
                        ? `${formatQty(ing.quantity_g)} g`
                        : ing.quantity_ml !== null
                          ? `${formatQty(ing.quantity_ml)} ml`
                          : "al gusto")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrición declarada */}
          <div className="rounded-[14px] border border-nori-border bg-nori-card p-5">
            <div className="mb-[14px] flex items-baseline justify-between">
              <span className="text-[13px] font-semibold">Nutrición estimada</span>
              {nutrition?.serving_size_g !== null && nutrition?.serving_size_g !== undefined ? (
                <span className="text-[11px] text-nori-text-dim">
                  por envase ~{formatQty(nutrition.serving_size_g)} g
                </span>
              ) : (
                <span className="text-[11px] text-nori-text-dim">por envase</span>
              )}
            </div>
            {nutrition ? (
              <div className="flex flex-col">
                {NUTRITION_FIELDS.map((f) => {
                  const value = nutrition[f.key] as number | null;
                  if (value === null || value === undefined) return null;
                  return (
                    <div
                      key={f.key}
                      className="flex justify-between border-b border-white/[0.05] py-[7px] text-[12.5px] last:border-b-0"
                    >
                      <span className="text-nori-text-muted">{f.label}</span>
                      <span className="font-mono font-semibold">
                        {formatQty(value)} {f.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[12px] text-nori-text-dim">Sin nutrición declarada.</div>
            )}
          </div>

          {/* Proceso */}
          {processSteps.length > 0 ? (
            <div className="rounded-[14px] border border-nori-border bg-nori-card p-5">
              <div className="mb-[14px] text-[13px] font-semibold">Proceso</div>
              <ol className="flex flex-col gap-[10px]">
                {processSteps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-[12.5px] leading-relaxed text-nori-text-body">
                    <span className="flex-none font-mono text-[11px] text-nori-terracota">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {/* Sellos NOM-051 */}
          <div className="rounded-[14px] border border-nori-border bg-nori-card p-5">
            <div className="mb-[14px] text-[13px] font-semibold">Sellos NOM-051</div>
            {selected.seals.length > 0 ? (
              <div className="flex flex-col">
                {selected.seals.map((seal) => (
                  <div
                    key={seal.id}
                    className="flex items-baseline justify-between gap-3 border-b border-white/[0.05] py-[7px] text-[12px] last:border-b-0"
                  >
                    <span className={seal.passes ? "text-nori-terracota" : "text-nori-red"}>
                      {seal.passes ? "✓" : "✕"} {seal.seal_name}
                    </span>
                    <span className="flex-none whitespace-nowrap font-mono text-[10.5px] text-nori-text-dim">
                      {seal.actual_value ? `${seal.actual_value} · ` : ""}
                      {seal.threshold ? `límite ${seal.threshold}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[12px] text-nori-text-dim">Sin evaluación de sellos.</div>
            )}
          </div>
        </div>

        {selected.notes ? (
          <div className="mt-4 max-w-4xl rounded-[14px] border border-nori-border bg-nori-card p-5">
            <div className="mb-2 text-[13px] font-semibold">Notas</div>
            <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-nori-text-body">
              {selected.notes}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
