import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBrandRecipeData } from "@/lib/nori/data";
import type { RecipeNutritionRow } from "@/lib/supabase/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupRequired } from "@/components/nori/setup-required";
import { NuevaBrandRecetaForm } from "@/app/(app)/recetario/nueva-brand-receta-form";

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

  // Barra de recetas (chips) — consistente con el formulador. Siempre visible
  // para poder crear la primera receta aunque el recetario esté vacío.
  const selected = recipes.length > 0 ? (r ? recipes.find((rec) => rec.slug === r) : null) ?? recipes[0] : null;

  const chipBar = (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-nori-border px-4 py-3 md:px-6">
      {recipes.map((rec) => (
        <Link
          key={rec.id}
          href={`/recetario?r=${rec.slug}`}
          className="flex-none rounded-full px-3 py-[6px] text-[12px] transition-colors"
          style={{
            background: rec.id === selected?.id ? "rgba(201,131,79,0.15)" : "rgba(255,255,255,0.04)",
            color: rec.id === selected?.id ? "#C9834F" : "#9C978F",
          }}
        >
          {rec.name}
          {rec.seasonal ? " ✦" : ""}
        </Link>
      ))}
      <div className="ml-auto flex-none pl-2">
        <NuevaBrandRecetaForm />
      </div>
    </div>
  );

  if (!selected) {
    return (
      <div className="flex h-full flex-col">
        {chipBar}
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="text-[15px] font-semibold">El recetario está vacío</div>
          <p className="max-w-md text-[13px] leading-relaxed text-nori-text-dim">
            Aquí viven las recetas oficiales de marca NORI: bases por máquina, variantes de sabor,
            nutrición estimada y validación de sellos NOM-051. Usa{" "}
            <span className="text-nori-terracota">+ Nueva receta</span> para crear la primera.
          </p>
        </div>
      </div>
    );
  }

  const nutrition = selected.nutrition;
  const processSteps = Array.isArray(selected.process_steps) ? selected.process_steps : [];

  return (
    <div className="flex h-full flex-col">
      {chipBar}

      <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-7">
        {/* encabezado */}
        <div className="nori-fade-up mb-4 rounded-2xl border border-nori-border bg-nori-card p-5">
          <div className="mb-1 flex flex-wrap items-center gap-[10px]">
            <span className="text-[20px] font-bold tracking-[-0.3px]">{selected.name}</span>
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
            {selected.base_recipe_id ? (
              <span className="rounded-full bg-white/[0.05] px-[11px] py-1 text-[11px] text-nori-text-dim">
                variante
              </span>
            ) : null}
          </div>
          {selected.description ? (
            <p className="max-w-2xl text-[13px] leading-relaxed text-nori-text-body">
              {selected.description}
            </p>
          ) : null}
          {selected.base ? (
            <div className="mt-2 text-[12.5px] text-nori-text-muted">
              Delta sobre{" "}
              <Link
                href={`/recetario?r=${selected.base.slug}`}
                className="text-nori-terracota underline-offset-2 hover:underline"
              >
                {selected.base.name}
              </Link>{" "}
              — abajo se listan solo los cambios respecto a la base.
            </div>
          ) : null}
          {!selected.is_lab_verified ? (
            <div className="mt-3 max-w-2xl rounded-[10px] border border-nori-amber/25 bg-nori-amber/[0.06] px-4 py-3 text-[12.5px] leading-relaxed text-nori-amber">
              Valores estimados con tablas estándar de ingredientes — NO son análisis de laboratorio.
              El bromatológico es obligatorio antes de empaque comercial.
            </div>
          ) : null}
        </div>

        <div className="grid max-w-4xl grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Ingredientes */}
          <div className="nori-fade-up rounded-[14px] border border-nori-border bg-nori-card p-5">
            <div className="mb-[14px] text-[13px] font-semibold">
              {selected.base ? "Cambios vs. la base" : "Ingredientes (por pinta ~475 ml)"}
            </div>
            {selected.ingredients.length > 0 ? (
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
            ) : (
              <div className="text-[12px] text-nori-text-dim">Sin ingredientes registrados.</div>
            )}
          </div>

          {/* Nutrición declarada */}
          <div className="nori-fade-up rounded-[14px] border border-nori-border bg-nori-card p-5">
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
            <div className="nori-fade-up rounded-[14px] border border-nori-border bg-nori-card p-5">
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
          <div className="nori-fade-up rounded-[14px] border border-nori-border bg-nori-card p-5">
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
          <div className="nori-fade-up mt-4 max-w-4xl rounded-[14px] border border-nori-border bg-nori-card p-5">
            <div className="mb-2 text-[13px] font-semibold">Notas</div>
            <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-nori-text-body">
              {selected.notes}
            </p>
          </div>
        ) : null}

        {/* Reglas de formulación */}
        {rules.length > 0 ? (
          <div className="nori-fade-up mt-4 max-w-4xl rounded-[14px] border border-nori-border bg-nori-card p-5">
            <div className="mb-3 text-[13px] font-semibold">Reglas de formulación</div>
            <ol className="flex flex-col gap-2">
              {rules.map((rule) => (
                <li key={rule.id} className="text-[12px] leading-relaxed">
                  <span className="font-semibold text-nori-text">{rule.rule}.</span>{" "}
                  {rule.rationale ? <span className="text-nori-text-dim">{rule.rationale}</span> : null}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </div>
  );
}
