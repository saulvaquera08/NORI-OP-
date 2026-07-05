"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { computeRecipeCalc, type IngredientNutrition, type RecipeRowInput } from "@/lib/nori/recipe-calc";
import {
  addRecipeIngredient,
  removeRecipeIngredient,
  saveAsNewVersion,
  updateRecipeIngredientGrams,
} from "@/lib/nori/actions";
import { NuevaRecetaForm } from "@/app/(app)/formulador/nueva-receta-form";

type VersionSummary = { id: string; versionNumber: number; status: string };

// La cantidad se guarda siempre en gramos; los líquidos (unit 'L') se
// capturan y muestran en ml con densidad ≈ 1 (decisión D-013).
const displayUnit = (ing: IngredientNutrition) => (ing.unit === "L" ? "ml" : "g");

export function FormuladorScreen({
  recipes,
  recipeId,
  recipeName,
  versions,
  selectedVersionId,
  selectedVersionNumber,
  selectedStatus,
  sellPrice,
  servingMl,
  initialRows,
  catalog,
  packagingLow,
}: {
  recipes: { id: string; name: string }[];
  recipeId: string;
  recipeName: string;
  versions: VersionSummary[];
  selectedVersionId: string;
  selectedVersionNumber: number;
  selectedStatus: string;
  sellPrice: number;
  servingMl: number;
  initialRows: RecipeRowInput[];
  catalog: IngredientNutrition[];
  packagingLow: { min: number; max: number } | null;
}) {
  const editable = selectedStatus === "vigente";
  const [rows, setRows] = useState<RecipeRowInput[]>(initialRows);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pickerId, setPickerId] = useState("");
  const [isSaving, startSaving] = useTransition();
  const [, startTransition] = useTransition();
  const debounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const router = useRouter();

  const calc = useMemo(() => computeRecipeCalc(rows, sellPrice, servingMl), [rows, sellPrice, servingMl]);
  const totalGrams = calc.totalGrams || 1;
  const porcionLabel = servingMl === 475 ? "pinta" : `porción ${servingMl} ml`;
  const available = catalog.filter((c) => !rows.some((r) => r.ingredient.id === c.id));

  function persistGrams(ingredientId: string, grams: number) {
    if (debounceRefs.current[ingredientId]) clearTimeout(debounceRefs.current[ingredientId]);
    debounceRefs.current[ingredientId] = setTimeout(() => {
      startTransition(() => {
        updateRecipeIngredientGrams(selectedVersionId, ingredientId, grams).catch(() =>
          setSaveError("⚠ El último cambio no se guardó — revisa tu conexión.")
        );
      });
    }, 400);
  }

  function setGrams(ingredientId: string, grams: number) {
    const safe = Math.max(0, Math.round(grams * 10) / 10);
    setRows((rs) => rs.map((r) => (r.ingredient.id === ingredientId ? { ...r, grams: safe } : r)));
    persistGrams(ingredientId, safe);
  }

  function onAddIngredient(ing: IngredientNutrition) {
    if (rows.some((r) => r.ingredient.id === ing.id)) return;
    setRows((rs) => [...rs, { ingredient: ing, grams: 50 }]);
    startTransition(() => {
      addRecipeIngredient(selectedVersionId, ing.id).catch(() =>
        setSaveError("⚠ No se pudo agregar el ingrediente — revisa tu conexión.")
      );
    });
  }

  function onRemoveIngredient(ingredientId: string) {
    setRows((rs) => rs.filter((r) => r.ingredient.id !== ingredientId));
    startTransition(() => {
      removeRecipeIngredient(selectedVersionId, ingredientId).catch(() =>
        setSaveError("⚠ No se pudo quitar el ingrediente — revisa tu conexión.")
      );
    });
  }

  function onSaveAsNewVersion() {
    setSaveError(null);
    startSaving(async () => {
      try {
        await saveAsNewVersion(selectedVersionId);
        router.push(`/formulador?rec=${recipeId}`);
        router.refresh();
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "No se pudo guardar la versión.");
      }
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* ---- barra de recetas ---- */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-nori-border px-4 py-3 md:px-6">
        {recipes.map((r) => (
          <Link
            key={r.id}
            href={`/formulador?rec=${r.id}`}
            className="flex-none rounded-full px-3 py-[6px] text-[12px] transition-colors"
            style={{
              background: r.id === recipeId ? "rgba(201,131,79,0.15)" : "rgba(255,255,255,0.04)",
              color: r.id === recipeId ? "#C9834F" : "#9C978F",
            }}
          >
            {r.name}
          </Link>
        ))}
        <div className="ml-auto flex-none pl-2">
          <NuevaRecetaForm />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        {/* ---- catálogo (solo desktop) ---- */}
        <div className="hidden w-[210px] flex-none border-r border-nori-border p-3 pt-[18px] md:block md:overflow-y-auto">
          <div className="mb-3 text-[11px] uppercase tracking-[0.5px] text-nori-text-dim">Catálogo</div>
          {catalog.map((ing) => {
            const already = rows.some((r) => r.ingredient.id === ing.id);
            return (
              <div
                key={ing.id}
                className="mb-[2px] flex items-center justify-between rounded-lg px-2 py-[9px] hover:bg-white/[0.04]"
              >
                <div className="min-w-0" title={ing.name}>
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] text-[#E5E1D9]">
                    {ing.name}
                  </div>
                  <div className="font-mono text-[10.5px] text-nori-text-dim">
                    ${ing.pricePerKg}/{ing.unit}
                  </div>
                </div>
                {editable && (
                  <button
                    onClick={() => onAddIngredient(ing)}
                    disabled={already}
                    className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-nori-terracota/10 text-[15px] leading-none text-nori-terracota disabled:opacity-30"
                  >
                    +
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ---- editor ---- */}
        <div className="min-w-0 p-4 pt-4 md:flex-1 md:overflow-y-auto md:p-6 md:pt-5">
          {/* encabezado */}
          <div className="mb-3 rounded-2xl border border-nori-border bg-nori-card p-4">
            <div className="flex flex-wrap items-center gap-[10px]">
              <span className="text-[19px] font-bold tracking-[-0.3px]">{recipeName}</span>
              <span className="rounded-full bg-nori-terracota/[0.12] px-[9px] py-[3px] font-mono text-[11px] text-nori-terracota">
                V{selectedVersionNumber} · {selectedStatus === "vigente" ? "vigente" : selectedStatus}
              </span>
              {editable && (
                <button
                  onClick={onSaveAsNewVersion}
                  disabled={isSaving || rows.length === 0}
                  className="ml-auto rounded-lg bg-nori-terracota px-3 py-2 text-[12px] font-semibold text-nori-terracota-deep disabled:opacity-50"
                >
                  {isSaving
                    ? "Guardando…"
                    : `Guardar como V${Math.max(...versions.map((v) => v.versionNumber)) + 1}`}
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-[6px]">
              {versions.map((ver) => (
                <Link
                  key={ver.id}
                  href={`/formulador?rec=${recipeId}&v=${ver.versionNumber}`}
                  className="rounded-full px-[9px] py-[3px] font-mono text-[11px]"
                  style={{
                    background:
                      ver.id === selectedVersionId ? "rgba(201,131,79,0.18)" : "rgba(255,255,255,0.04)",
                    color: ver.id === selectedVersionId ? "#C9834F" : "#7A756D",
                  }}
                >
                  V{ver.versionNumber}
                </Link>
              ))}
              <span className="ml-1 text-[10.5px] text-nori-text-dim">las versiones nunca se borran</span>
            </div>
            {saveError ? <div className="mt-2 text-[12px] text-nori-red">{saveError}</div> : null}
          </div>

          {/* agregar ingrediente (móvil y también cómodo en desktop) */}
          {editable && available.length > 0 && (
            <div className="mb-3 flex gap-2 md:hidden">
              <select
                value={pickerId}
                onChange={(e) => setPickerId(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-nori-input px-3 py-3 text-[14px] text-nori-text"
              >
                <option value="">Agregar ingrediente…</option>
                {available.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} · ${ing.pricePerKg}/{ing.unit}
                  </option>
                ))}
              </select>
              <button
                disabled={!pickerId}
                onClick={() => {
                  const ing = available.find((i) => i.id === pickerId);
                  if (ing) onAddIngredient(ing);
                  setPickerId("");
                }}
                className="flex-none rounded-xl bg-nori-terracota px-4 text-[20px] font-semibold text-nori-terracota-deep disabled:opacity-40"
              >
                +
              </button>
            </div>
          )}

          {/* filas de ingredientes */}
          <div className="flex flex-col gap-2">
            {rows.map((row) => {
              const pct = totalGrams > 0 ? ((row.grams / totalGrams) * 100).toFixed(1) : "0.0";
              const cost = ((row.grams * row.ingredient.pricePerKg) / 1000).toFixed(2);
              const u = displayUnit(row.ingredient);
              return (
                <div
                  key={row.ingredient.id}
                  className="rounded-xl border border-nori-border bg-nori-card p-3"
                >
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <span className="min-w-0 truncate text-[13.5px] font-medium" title={row.ingredient.name}>
                      {row.ingredient.name}
                    </span>
                    <span className="flex-none font-mono text-[12px] text-nori-text-body">${cost}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10.5px] text-nori-text-dim">{pct}% de la mezcla</span>
                    <div className="flex items-center gap-1">
                      {editable && (
                        <button
                          onClick={() => setGrams(row.ingredient.id, row.grams - 5)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-nori-input text-[16px] text-nori-text-muted"
                        >
                          −
                        </button>
                      )}
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="decimal"
                          value={row.grams}
                          disabled={!editable}
                          onChange={(e) => setGrams(row.ingredient.id, parseFloat(e.target.value) || 0)}
                          className="w-[86px] rounded-lg border border-white/[0.08] bg-nori-input py-2 pl-2 pr-8 text-center font-mono text-[14px] text-nori-text disabled:opacity-60"
                        />
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-nori-text-dim">
                          {u}
                        </span>
                      </div>
                      {editable && (
                        <button
                          onClick={() => setGrams(row.ingredient.id, row.grams + 5)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-nori-input text-[16px] text-nori-text-muted"
                        >
                          +
                        </button>
                      )}
                      {editable && (
                        <button
                          onClick={() => onRemoveIngredient(row.ingredient.id)}
                          className="ml-1 flex h-9 w-7 items-center justify-center rounded-lg text-[15px] text-nori-text-dim hover:text-nori-red"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {rows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.12] p-5 text-center text-[13px] text-nori-text-dim">
                Agrega ingredientes del catálogo para empezar a formular.
              </div>
            ) : null}
          </div>
        </div>

        {/* ---- panel en vivo ---- */}
        <div className="w-full border-t border-nori-border p-4 md:w-[248px] md:flex-none md:overflow-y-auto md:border-l md:border-t-0 md:p-[14px] md:pt-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-[6px] w-[6px] rounded-full bg-nori-terracota" />
            <span className="text-[11px] uppercase tracking-[0.5px] text-nori-text-dim">En vivo</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-nori-border bg-nori-card">
            <div className="grid grid-cols-2 divide-x divide-white/[0.05] border-b border-white/[0.05]">
              <div className="p-3">
                <div className="text-[10px] uppercase tracking-[0.4px] text-nori-text-dim">Costo lote</div>
                <div className="font-mono text-[17px] font-bold">${calc.totalCost.toFixed(2)}</div>
              </div>
              <div className="p-3">
                <div className="text-[10px] uppercase tracking-[0.4px] text-nori-text-dim">Peso</div>
                <div className="font-mono text-[17px] font-bold">{calc.totalGrams.toFixed(0)} g</div>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-white/[0.05]">
              <div className="p-3">
                <div className="text-[10px] uppercase tracking-[0.4px] text-nori-text-dim">$/litro</div>
                <div className="font-mono text-[15px] font-bold">${calc.costPerLiter.toFixed(2)}</div>
              </div>
              <div className="p-3">
                <div className="text-[10px] uppercase tracking-[0.4px] text-nori-text-dim">$/{porcionLabel}</div>
                <div className="font-mono text-[15px] font-bold text-nori-terracota">
                  ${calc.costPerVaso.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-nori-border bg-nori-card p-3">
            <div className="mb-2 text-[10px] uppercase tracking-[0.4px] text-nori-text-dim">
              Nutrición por {porcionLabel}
            </div>
            {[
              ["Proteína", `${calc.proteinVaso.toFixed(1)} g`],
              ["Calorías", `${Math.round(calc.caloriesVaso)}`],
              ["Carbohidratos", `${calc.carbsVaso.toFixed(1)} g`],
              ["Grasas", `${calc.fatVaso.toFixed(1)} g`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-white/[0.04] py-[6px] text-[12.5px] last:border-b-0">
                <span className="text-nori-text-muted">{k}</span>
                <span className="font-mono font-semibold">{v}</span>
              </div>
            ))}
            <div className="mt-2 text-[9.5px] leading-relaxed text-nori-text-dim">
              Estimado (tabla estándar, pendiente bromatológico). Las kcal excluyen carbohidratos no
              metabolizables.
            </div>
          </div>

          {packagingLow ? (
            <div className="mt-3 rounded-2xl border border-nori-border bg-nori-card p-3">
              <div className="text-[10px] uppercase tracking-[0.4px] text-nori-text-dim">
                Costo + empaque (${packagingLow.min}-{packagingLow.max})
              </div>
              <div className="font-mono text-[14px] font-bold">
                ${(calc.costPerVaso + packagingLow.min).toFixed(2)} – $
                {(calc.costPerVaso + packagingLow.max).toFixed(2)}
              </div>
            </div>
          ) : null}

          <div className="mt-3 rounded-2xl border border-nori-glaciar/[0.22] bg-nori-glaciar/[0.06] p-3">
            <div className="text-[10px] uppercase tracking-[0.4px] text-nori-text-muted">
              Margen {packagingLow ? "real" : ""} (venta ${sellPrice})
            </div>
            <div className="font-mono text-[19px] font-bold text-nori-glaciar">
              {packagingLow && sellPrice > 0
                ? `${(((sellPrice - calc.costPerVaso - packagingLow.max) / sellPrice) * 100).toFixed(1)}–${(((sellPrice - calc.costPerVaso - packagingLow.min) / sellPrice) * 100).toFixed(1)}%`
                : `${calc.margin.toFixed(1)}%`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
