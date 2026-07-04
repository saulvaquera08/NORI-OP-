import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatShortDate } from "@/lib/nori/format";
import { NuevaOrdenForm } from "@/app/(app)/produccion/nueva-orden-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupRequired } from "@/components/nori/setup-required";
import { EmptyState } from "@/components/nori/empty-state";
import { OrdenStatusActions } from "@/app/(app)/produccion/orden-status-actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  en_proceso: "En proceso",
  completada: "Completada",
  cancelada: "Cancelada",
};
const STATUS_COLOR: Record<string, string> = {
  completada: "#C9834F",
  en_proceso: "#D9A15C",
  cancelada: "#C1584A",
};

type OrderWithRecipe = {
  id: string;
  code: string;
  operator: string;
  status: string;
  lot_code: string | null;
  temperature_c: number | null;
  yield_units: number;
  merma_pct: number;
  notes: string | null;
  produced_at: string;
  created_at: string;
  recipe_version: { version_number: number; recipe: { name: string } | null } | null;
};

export default async function ProduccionPage({
  searchParams,
}: {
  searchParams: Promise<{ o?: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const { o } = await searchParams;
  const supabase = await createClient();

  const [ordersRes, recipeOptionsRes] = await Promise.all([
    supabase
      .from("production_orders")
      .select("*, recipe_version:recipe_versions(version_number, recipe:recipes(name))")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("recipe_versions")
      .select("id, version_number, recipe:recipes(name)")
      .eq("status", "vigente"),
  ]);

  const orders = (ordersRes.data ?? []) as unknown as OrderWithRecipe[];
  const selected = (o ? orders.find((ord) => ord.code === o) : null) ?? orders[0];

  const recipeOptions = (recipeOptionsRes.data ?? []).map((r) => ({
    id: r.id,
    label: `${(r.recipe as unknown as { name: string } | null)?.name ?? "Receta"} V${r.version_number}`,
  }));

  const recipeName = (recipe: OrderWithRecipe) => recipe.recipe_version?.recipe?.name ?? "Receta";
  const versionLabel = (recipe: OrderWithRecipe) =>
    recipe.recipe_version ? `V${recipe.recipe_version.version_number}` : "";

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="max-h-[45vh] w-full flex-none overflow-y-auto border-b border-nori-border p-[18px] md:max-h-none md:w-[340px] md:border-b-0 md:border-r">
        <div className="mb-3 text-[11px] uppercase tracking-[0.5px] text-nori-text-dim">
          Órdenes de producción
        </div>
        {recipeOptions.length > 0 ? (
          <NuevaOrdenForm recipeOptions={recipeOptions} />
        ) : (
          <div className="mb-3 rounded-[9px] border border-nori-border bg-nori-card p-3 text-[11.5px] leading-relaxed text-nori-text-dim">
            Para crear órdenes se necesita al menos una receta con versiones en el formulador.
          </div>
        )}
        {orders.map((ord) => (
          <Link
            key={ord.id}
            href={`/produccion?o=${ord.code}`}
            className="mb-2 block rounded-[11px] p-[14px]"
            style={{
              background: selected?.id === ord.id ? "rgba(201,131,79,0.06)" : "#1B1F25",
              border: `1px solid ${selected?.id === ord.id ? "rgba(201,131,79,0.28)" : "rgba(255,255,255,0.06)"}`,
            }}
          >
            <div className="mb-[6px] flex justify-between">
              <span className="font-mono text-[12.5px] text-nori-text-muted">{ord.code}</span>
              <span
                className="rounded-full px-[11px] py-[3px] text-[10.5px]"
                style={{ color: STATUS_COLOR[ord.status], background: `${STATUS_COLOR[ord.status]}1A` }}
              >
                {STATUS_LABEL[ord.status]}
              </span>
            </div>
            <div className="mb-1 text-sm font-semibold">
              {recipeName(ord)} {versionLabel(ord)}
            </div>
            <div className="text-[11.5px] text-nori-text-dim">
              {formatShortDate(ord.produced_at)} · {ord.operator}
            </div>
          </Link>
        ))}
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-7">
        {selected ? (
          <>
            <div className="mb-[6px] flex items-center gap-[10px]">
              <span className="text-xl font-bold">
                {recipeName(selected)} {versionLabel(selected)}
              </span>
              <span
                className="rounded-full px-[11px] py-1 text-[11px]"
                style={{
                  color: STATUS_COLOR[selected.status],
                  background: `${STATUS_COLOR[selected.status]}1A`,
                }}
              >
                {STATUS_LABEL[selected.status]}
              </span>
            </div>
            <div className="mb-4 text-[12.5px] text-nori-text-muted">
              {selected.code} · lote {selected.lot_code ?? "—"}
            </div>
            {selected.status === "en_proceso" ? <OrdenStatusActions orderId={selected.id} /> : null}

            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-[11px] border border-nori-border bg-nori-card p-[14px]">
                <div className="mb-[6px] text-[11px] text-nori-text-muted">Temperatura</div>
                <div className="font-mono text-[17px] font-bold">
                  {selected.temperature_c ?? "—"}
                  {selected.temperature_c !== null ? "°C" : ""}
                </div>
              </div>
              <div className="rounded-[11px] border border-nori-border bg-nori-card p-[14px]">
                <div className="mb-[6px] text-[11px] text-nori-text-muted">Rendimiento</div>
                <div className="font-mono text-[17px] font-bold">{selected.yield_units} vasos</div>
              </div>
              <div className="rounded-[11px] border border-nori-border bg-nori-card p-[14px]">
                <div className="mb-[6px] text-[11px] text-nori-text-muted">Merma</div>
                <div className="font-mono text-[17px] font-bold">{Number(selected.merma_pct)}%</div>
              </div>
              <div className="rounded-[11px] border border-nori-border bg-nori-card p-[14px]">
                <div className="mb-[6px] text-[11px] text-nori-text-muted">Operador</div>
                <div className="text-[15px] font-semibold">{selected.operator}</div>
              </div>
            </div>

            <div className="mb-[10px] text-xs uppercase tracking-[0.5px] text-nori-text-dim">
              Fotografías del lote
            </div>
            <div className="mb-[22px] flex gap-[10px]">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="flex h-[88px] w-[120px] items-center justify-center rounded-[10px] border border-dashed border-white/[0.14] bg-nori-photo text-[10.5px] text-nori-text-dim"
                >
                  foto {n}
                </div>
              ))}
            </div>

            <div className="mb-[10px] text-xs uppercase tracking-[0.5px] text-nori-text-dim">Observaciones</div>
            <div className="rounded-[11px] border border-nori-border bg-nori-card p-[14px] text-[13px] leading-relaxed text-nori-text-body">
              {selected.notes || "Sin observaciones."}
            </div>
          </>
        ) : (
          <EmptyState
            title="Sin órdenes de producción"
            description="Cuando registres tu primer lote aparecerá aquí con su temperatura, rendimiento, merma y observaciones. Cada orden descuenta automáticamente el inventario de ingredientes."
            hint="Se necesita una receta con versiones y el catálogo de ingredientes para crear órdenes."
          />
        )}
      </div>
    </div>
  );
}
