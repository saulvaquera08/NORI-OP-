"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { computeRecipeCalc, type IngredientNutrition, type RecipeRowInput } from "@/lib/nori/recipe-calc";
import { addRecipeIngredient, removeRecipeIngredient, updateRecipeIngredientGrams } from "@/lib/nori/actions";

type VersionSummary = { id: string; versionNumber: number; status: string };

export function FormuladorScreen({
  recipeName,
  versions,
  selectedVersionId,
  selectedVersionNumber,
  selectedStatus,
  sellPrice,
  initialRows,
  catalog,
}: {
  recipeName: string;
  versions: VersionSummary[];
  selectedVersionId: string;
  selectedVersionNumber: number;
  selectedStatus: string;
  sellPrice: number;
  initialRows: RecipeRowInput[];
  catalog: IngredientNutrition[];
}) {
  const editable = selectedStatus === "vigente";
  const [rows, setRows] = useState<RecipeRowInput[]>(initialRows);
  const [, startTransition] = useTransition();
  const debounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const calc = useMemo(() => computeRecipeCalc(rows, sellPrice), [rows, sellPrice]);
  const totalGrams = calc.totalGrams || 1;

  function persistGrams(ingredientId: string, grams: number) {
    if (debounceRefs.current[ingredientId]) clearTimeout(debounceRefs.current[ingredientId]);
    debounceRefs.current[ingredientId] = setTimeout(() => {
      startTransition(() => {
        updateRecipeIngredientGrams(selectedVersionId, ingredientId, grams).catch(() => {});
      });
    }, 400);
  }

  function onChangeGrams(ingredientId: string, value: string) {
    const grams = Math.max(0, parseFloat(value) || 0);
    setRows((rs) => rs.map((r) => (r.ingredient.id === ingredientId ? { ...r, grams } : r)));
    persistGrams(ingredientId, grams);
  }

  function onAddIngredient(ing: IngredientNutrition) {
    if (rows.some((r) => r.ingredient.id === ing.id)) return;
    setRows((rs) => [...rs, { ingredient: ing, grams: 50 }]);
    startTransition(() => {
      addRecipeIngredient(selectedVersionId, ing.id).catch(() => {});
    });
  }

  function onRemoveIngredient(ingredientId: string) {
    setRows((rs) => rs.filter((r) => r.ingredient.id !== ingredientId));
    startTransition(() => {
      removeRecipeIngredient(selectedVersionId, ingredientId).catch(() => {});
    });
  }

  return (
    <div className="flex h-full">
      {/* ---- ingredient catalog ---- */}
      <div className="w-[200px] flex-none overflow-y-auto border-r border-nori-border p-3 pt-[18px]">
        <div className="mb-3 text-[11px] uppercase tracking-[0.5px] text-nori-text-dim">Ingredientes</div>
        {catalog.map((ing) => {
          const already = rows.some((r) => r.ingredient.id === ing.id);
          return (
            <div
              key={ing.id}
              className="mb-[2px] flex items-center justify-between rounded-lg px-2 py-[9px] hover:bg-white/[0.04]"
            >
              <div className="min-w-0">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] text-[#E5E1D9]">
                  {ing.name}
                </div>
                <div className="font-mono text-[10.5px] text-nori-text-dim">${ing.pricePerKg}/kg</div>
              </div>
              {editable && (
                <button
                  onClick={() => onAddIngredient(ing)}
                  disabled={already}
                  className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-md bg-nori-terracota/10 text-[15px] leading-none text-nori-terracota disabled:opacity-30"
                >
                  +
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- recipe editor ---- */}
      <div className="min-w-0 flex-1 overflow-y-auto p-6 pt-5">
        <div className="mb-1 flex items-center gap-[10px]">
          <span className="text-xl font-bold">{recipeName}</span>
          <span className="rounded-full bg-nori-terracota/[0.12] px-[9px] py-[3px] font-mono text-[11px] text-nori-terracota">
            V{selectedVersionNumber} · {selectedStatus === "vigente" ? "vigente" : selectedStatus}
          </span>
        </div>
        <div className="mb-[18px] flex flex-wrap items-center gap-[6px]">
          {versions.map((ver) => (
            <Link
              key={ver.id}
              href={`/formulador?v=${ver.versionNumber}`}
              className="rounded-full px-[9px] py-[3px] font-mono text-[11px]"
              style={{
                background: ver.id === selectedVersionId ? "rgba(201,131,79,0.18)" : "rgba(255,255,255,0.04)",
                color: ver.id === selectedVersionId ? "#C9834F" : "#7A756D",
              }}
            >
              V{ver.versionNumber}
            </Link>
          ))}
          <span className="ml-[6px] text-[11px] text-nori-text-dim">las versiones nunca se borran</span>
        </div>

        <div className="flex flex-col gap-[6px] overflow-x-auto">
          <div className="grid min-w-[284px] grid-cols-[minmax(120px,1fr)_60px_64px_20px] gap-2 px-[10px] text-[10px] uppercase tracking-[0.3px] text-nori-text-dim">
            <span>Ingrediente</span>
            <span>Gramos</span>
            <span>Costo</span>
            <span></span>
          </div>
          {rows.map((row) => {
            const pct = totalGrams > 0 ? ((row.grams / totalGrams) * 100).toFixed(1) : "0.0";
            const cost = ((row.grams * row.ingredient.pricePerKg) / 1000).toFixed(2);
            return (
              <div
                key={row.ingredient.id}
                className="grid min-w-[284px] grid-cols-[minmax(120px,1fr)_60px_64px_20px] items-center gap-2 rounded-[10px] border border-nori-border bg-nori-card p-[10px]"
              >
                <div className="min-w-0">
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px]">
                    {row.ingredient.name}
                  </div>
                  <div className="font-mono text-[10px] text-nori-text-dim">{pct}%</div>
                </div>
                <input
                  type="number"
                  value={row.grams}
                  disabled={!editable}
                  onChange={(e) => onChangeGrams(row.ingredient.id, e.target.value)}
                  className="w-full min-w-0 rounded-[6px] border border-white/[0.08] bg-nori-input px-1 py-[6px] text-center font-mono text-[11.5px] text-nori-text disabled:opacity-60"
                />
                <span className="whitespace-nowrap font-mono text-[11.5px] text-[#C7C2B8]">${cost}</span>
                {editable ? (
                  <button
                    onClick={() => onRemoveIngredient(row.ingredient.id)}
                    className="flex h-5 w-5 flex-none items-center justify-center rounded-md text-[13px] text-nori-text-dim"
                  >
                    ×
                  </button>
                ) : (
                  <span />
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* ---- live panel ---- */}
      <div className="w-[228px] flex-none overflow-y-auto border-l border-nori-border p-[14px] pt-5">
        <div className="mb-[14px] text-[11px] uppercase tracking-[0.5px] text-nori-text-dim">En vivo</div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="min-w-0 rounded-[10px] border border-nori-border bg-nori-card p-[10px]">
            <div className="text-[10.5px] text-nori-text-muted">Costo del lote</div>
            <div className="font-mono text-lg font-bold">${calc.totalCost.toFixed(2)}</div>
          </div>
          <div className="rounded-[10px] border border-nori-border bg-nori-card p-3">
            <div className="text-[10.5px] text-nori-text-muted">Peso final</div>
            <div className="font-mono text-lg font-bold">{calc.totalGrams.toFixed(0)}g</div>
          </div>
          <div className="rounded-[10px] border border-nori-border bg-nori-card p-3">
            <div className="text-[10.5px] text-nori-text-muted">Costo / litro</div>
            <div className="font-mono text-base font-bold">${calc.costPerLiter.toFixed(2)}</div>
          </div>
          <div className="rounded-[10px] border border-nori-border bg-nori-card p-3">
            <div className="text-[10.5px] text-nori-text-muted">Costo / vaso</div>
            <div className="font-mono text-base font-bold text-nori-terracota">${calc.costPerVaso.toFixed(2)}</div>
          </div>
        </div>

        <div className="my-[10px] text-[11px] uppercase tracking-[0.5px] text-nori-text-dim">
          Nutrición por vaso
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[12.5px]">
            <span className="text-nori-text-muted">Proteína</span>
            <span className="font-mono font-semibold">{calc.proteinVaso.toFixed(1)} g</span>
          </div>
          <div className="flex justify-between text-[12.5px]">
            <span className="text-nori-text-muted">Calorías</span>
            <span className="font-mono font-semibold">{Math.round(calc.caloriesVaso)}</span>
          </div>
          <div className="flex justify-between text-[12.5px]">
            <span className="text-nori-text-muted">Carbohidratos</span>
            <span className="font-mono font-semibold">{calc.carbsVaso.toFixed(1)} g</span>
          </div>
          <div className="flex justify-between text-[12.5px]">
            <span className="text-nori-text-muted">Grasas</span>
            <span className="font-mono font-semibold">{calc.fatVaso.toFixed(1)} g</span>
          </div>
        </div>

        <div className="mt-[18px] rounded-[10px] border border-nori-glaciar/[0.22] bg-nori-glaciar/[0.06] p-3">
          <div className="mb-1 text-[10.5px] text-nori-text-muted">Margen estimado (venta ${sellPrice})</div>
          <div className="font-mono text-[19px] font-bold text-nori-glaciar">{calc.margin.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}
