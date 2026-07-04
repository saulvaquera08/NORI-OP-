import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatShortDate } from "@/lib/nori/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupRequired } from "@/components/nori/setup-required";
import { InventarioForms } from "@/app/(app)/inventario/inventario-forms";
import { NuevoIngredienteForm } from "@/app/(app)/inventario/nuevo-ingrediente-form";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "crit", label: "Stock bajo" },
  { key: "ok", label: "Suficiente" },
];

const MOVEMENT_STYLE: Record<string, string> = {
  entrada: "text-nori-terracota",
  salida: "text-nori-red",
  ajuste: "text-nori-amber",
};
const MOVEMENT_LABEL: Record<string, string> = { entrada: "Entrada", salida: "Salida", ajuste: "Ajuste" };

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const { f } = await searchParams;
  const filter = f ?? "all";
  const supabase = await createClient();

  const [ingredientsRes, movementsRes] = await Promise.all([
    supabase.from("ingredients").select("*").order("name"),
    supabase
      .from("inventory_movements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const ingredients = ingredientsRes.data ?? [];
  const filtered = ingredients.filter((i) => {
    const crit = Number(i.stock) < Number(i.stock_min);
    if (filter === "crit") return crit;
    if (filter === "ok") return !crit;
    return true;
  });

  return (
    <div className="p-7">
      <NuevoIngredienteForm />
      <InventarioForms
        ingredients={ingredients.map((i) => ({
          id: i.id,
          name: i.name,
          unit: i.unit,
          stock: Number(i.stock),
          stockMin: Number(i.stock_min),
        }))}
      />
      <div className="mb-5 flex gap-[10px]">
        {FILTERS.map((flt) => (
          <Link
            key={flt.key}
            href={`/inventario?f=${flt.key}`}
            className="rounded-[9px] px-[14px] py-2 text-[12.5px]"
            style={{
              background: filter === flt.key ? "#C9834F" : "#1B1F25",
              color: filter === flt.key ? "#241209" : "#9C978F",
              border: filter === flt.key ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {flt.label}
          </Link>
        ))}
      </div>

      <div className="mb-[22px] grid grid-cols-4 gap-[14px]">
        {filtered.map((it) => {
          const crit = Number(it.stock) < Number(it.stock_min);
          const pct = Math.min(100, (Number(it.stock) / (Number(it.stock_min) * 2 || 1)) * 100);
          return (
            <div key={it.id} className="rounded-[13px] border border-nori-border bg-nori-card p-4">
              <div className="mb-[10px] flex items-start justify-between">
                <span className="text-[13.5px] font-semibold">{it.name}</span>
                <span
                  className="rounded-full px-[9px] py-[3px] text-[10.5px]"
                  style={{
                    background: crit ? "rgba(193,88,74,0.12)" : "rgba(201,131,79,0.1)",
                    color: crit ? "#C1584A" : "#C9834F",
                  }}
                >
                  {crit ? "Stock bajo" : "OK"}
                </span>
              </div>
              <div className="mb-1 font-mono text-[22px] font-bold">
                {Number(it.stock)}
                <span className="text-xs font-medium text-nori-text-dim"> {it.unit}</span>
              </div>
              <div className="mb-2 h-[5px] overflow-hidden rounded-[3px] bg-white/[0.06]">
                <div
                  className="h-full"
                  style={{ background: crit ? "#C1584A" : "#C9834F", width: `${pct.toFixed(0)}%` }}
                />
              </div>
              <div className="text-[11px] text-nori-text-dim">
                mín. {Number(it.stock_min)} {it.unit} · lote {it.lot_code}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-4 text-[13px] text-nori-text-dim">Sin ingredientes en este filtro.</div>
        )}
      </div>

      <div className="rounded-[14px] border border-nori-border bg-nori-card p-5">
        <div className="mb-[14px] text-[13px] font-semibold">Movimientos recientes</div>
        <div className="flex flex-col gap-[2px]">
          {(movementsRes.data ?? []).map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-[90px_1.3fr_0.7fr_0.7fr] items-center gap-[10px] border-b border-white/[0.05] px-[6px] py-[10px] text-[12.5px]"
            >
              <span className="font-mono text-[11px] text-nori-text-dim">{formatShortDate(m.created_at)}</span>
              <span>{m.description}</span>
              <span className={`text-[11.5px] ${MOVEMENT_STYLE[m.type]}`}>{MOVEMENT_LABEL[m.type]}</span>
              <span className="font-mono text-[#C7C2B8]">
                {Number(m.quantity) > 0 ? "+" : ""}
                {Number(m.quantity)} {m.unit}
              </span>
            </div>
          ))}
          {(movementsRes.data ?? []).length === 0 && (
            <div className="py-2 text-[12.5px] text-nori-text-dim">Sin movimientos todavía.</div>
          )}
        </div>
      </div>
    </div>
  );
}
