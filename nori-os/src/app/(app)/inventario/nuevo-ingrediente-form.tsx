"use client";

import { useState, useTransition } from "react";
import { createIngredient } from "@/lib/nori/actions";

const inputCls =
  "rounded-lg border border-white/[0.08] bg-nori-input px-3 py-2 text-[12.5px] text-nori-text outline-none placeholder:text-nori-text-dim";

function NumField({
  label,
  value,
  onChange,
  width = "w-24",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  width?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-[11px] text-nori-text-dim">
      {label}
      <input
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className={`${inputCls} ${width} text-center font-mono`}
      />
    </label>
  );
}

export function NuevoIngredienteForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [unit, setUnit] = useState<"kg" | "L">("kg");
  const [price, setPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [brand, setBrand] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [nonMetab, setNonMetab] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");
  const [sodium, setSodium] = useState("");
  const [sugar, setSugar] = useState("");
  const [stock, setStock] = useState("");
  const [stockMin, setStockMin] = useState("");

  if (!open) {
    return (
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => {
            setOpen(true);
            setDone(false);
          }}
          className="cursor-pointer rounded-[9px] border border-nori-terracota/25 bg-nori-terracota/10 px-4 py-2 text-[12.5px] text-nori-terracota"
        >
          + Agregar ingrediente
        </button>
        {done ? <span className="text-[12px] text-nori-terracota">Ingrediente agregado ✓</span> : null}
      </div>
    );
  }

  const n = (v: string) => parseFloat(v) || 0;

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await createIngredient({
          name,
          unit,
          pricePerKg: n(price),
          supplier,
          brand,
          proteinG100g: n(protein),
          carbsG100g: n(carbs),
          nonMetabCarbsG100g: n(nonMetab),
          fatG100g: n(fat),
          fiberG100g: n(fiber),
          sodiumMg100g: n(sodium),
          sugarG100g: n(sugar),
          stock: n(stock),
          stockMin: n(stockMin),
        });
        setDone(true);
        setOpen(false);
        setName("");
        setPrice("");
        setSupplier("");
        setBrand("");
        setProtein("");
        setCarbs("");
        setNonMetab("");
        setFat("");
        setFiber("");
        setSodium("");
        setSugar("");
        setStock("");
        setStockMin("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo agregar el ingrediente.");
      }
    });
  }

  return (
    <div className="mb-4 rounded-[14px] border border-nori-border bg-nori-card p-4">
      <div className="mb-3 text-[13px] font-semibold">Agregar ingrediente al catálogo</div>

      <div className="mb-3 flex flex-wrap items-end gap-2">
        <label className="flex min-w-56 flex-1 flex-col gap-1 text-[11px] text-nori-text-dim">
          Nombre *
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ej. Cacao natural desgrasado" className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-nori-text-dim">
          Unidad
          <select value={unit} onChange={(e) => setUnit(e.target.value as "kg" | "L")} className={inputCls}>
            <option value="kg">kg</option>
            <option value="L">L</option>
          </select>
        </label>
        <NumField label={`Precio por ${unit} ($) *`} value={price} onChange={setPrice} width="w-28" />
        <label className="flex flex-col gap-1 text-[11px] text-nori-text-dim">
          Proveedor
          <input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="opcional" className={inputCls} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-nori-text-dim">
          Marca
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="opcional" className={inputCls} />
        </label>
      </div>

      <div className="mb-1 text-[11px] uppercase tracking-[0.5px] text-nori-text-dim">
        Nutrición por 100 g (de la etiqueta del ingrediente)
      </div>
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <NumField label="Proteína (g)" value={protein} onChange={setProtein} />
        <NumField label="Carbohidratos (g)" value={carbs} onChange={setCarbs} />
        <NumField label="…no metabolizables (g)" value={nonMetab} onChange={setNonMetab} width="w-32" />
        <NumField label="Grasas (g)" value={fat} onChange={setFat} />
        <NumField label="Fibra (g)" value={fiber} onChange={setFiber} />
        <NumField label="Sodio (mg)" value={sodium} onChange={setSodium} />
        <NumField label="Azúcares (g)" value={sugar} onChange={setSugar} />
      </div>
      <div className="mb-3 text-[10.5px] leading-relaxed text-nori-text-dim">
        Si dejas la nutrición en 0, el costo funcionará pero la tabla nutrimental de las recetas que lo usen
        quedará incompleta. "No metabolizables" = carbohidratos que no aportan calorías (ej. alulosa).
      </div>

      <div className="mb-3 flex flex-wrap items-end gap-2">
        <NumField label={`Stock actual (${unit})`} value={stock} onChange={setStock} />
        <NumField label={`Stock mínimo (${unit})`} value={stockMin} onChange={setStockMin} />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={submit}
          disabled={isPending || !name.trim()}
          className="rounded-lg bg-nori-terracota px-4 py-2 text-[12.5px] font-semibold text-nori-terracota-deep disabled:opacity-50"
        >
          {isPending ? "Guardando…" : "Agregar al catálogo"}
        </button>
        <button onClick={() => setOpen(false)} className="px-2 py-2 text-[12.5px] text-nori-text-muted">
          Cancelar
        </button>
        {error ? <span className="text-[12px] text-nori-red">{error}</span> : null}
      </div>
    </div>
  );
}
