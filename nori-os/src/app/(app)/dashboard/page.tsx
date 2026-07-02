import { createClient } from "@/lib/supabase/server";
import { formatMoney, formatTime } from "@/lib/nori/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupRequired } from "@/components/nori/setup-required";

export const dynamic = "force-dynamic";

function startOfMonthUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function daysAgo(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function isoDateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const supabase = await createClient();
  const now = new Date();
  const monthStart = startOfMonthUTC(now);
  const prevMonthStart = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 1, 1));
  const fourteenDaysAgo = daysAgo(13);
  const thirtyDaysAgo = daysAgo(29);
  const today = isoDateOnly(now);

  const [
    salesThisMonthRes,
    salesPrevMonthRes,
    completedOrdersThisMonthRes,
    todayOrdersRes,
    ingredientsRes,
    salesChartRes,
    productionChartRes,
    topProductsRes,
    settingsRes,
    recentSalesRes,
    recentOrdersRes,
    recentMovementsRes,
  ] = await Promise.all([
    supabase.from("sales_orders").select("amount").gte("created_at", monthStart.toISOString()),
    supabase
      .from("sales_orders")
      .select("amount")
      .gte("created_at", prevMonthStart.toISOString())
      .lt("created_at", monthStart.toISOString()),
    supabase
      .from("production_orders")
      .select("yield_units, cost_per_unit_snapshot")
      .eq("status", "completada")
      .gte("produced_at", isoDateOnly(monthStart)),
    supabase.from("production_orders").select("yield_units, status").eq("produced_at", today),
    supabase.from("ingredients").select("*").order("name"),
    supabase
      .from("sales_orders")
      .select("created_at, units")
      .gte("created_at", fourteenDaysAgo.toISOString()),
    supabase
      .from("production_orders")
      .select("produced_at, yield_units")
      .gte("produced_at", isoDateOnly(fourteenDaysAgo)),
    supabase
      .from("sales_orders")
      .select("product_name, units")
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase.from("company_settings").select("*").single(),
    supabase
      .from("sales_orders")
      .select("client_name, product_name, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("production_orders")
      .select("code, status, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("inventory_movements")
      .select("description, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const salesThisMonth = (salesThisMonthRes.data ?? []).reduce((a, r) => a + Number(r.amount), 0);
  const salesPrevMonth = (salesPrevMonthRes.data ?? []).reduce((a, r) => a + Number(r.amount), 0);
  const salesGrowthPct = salesPrevMonth > 0 ? ((salesThisMonth - salesPrevMonth) / salesPrevMonth) * 100 : 0;

  const productionCost = (completedOrdersThisMonthRes.data ?? []).reduce(
    (a, r) => a + Number(r.yield_units) * Number(r.cost_per_unit_snapshot ?? 0),
    0
  );
  const utilidad = salesThisMonth - productionCost;
  const margin = salesThisMonth > 0 ? (utilidad / salesThisMonth) * 100 : 0;

  const todayOrders = todayOrdersRes.data ?? [];
  const vasosHoy = todayOrders.reduce((a, r) => a + Number(r.yield_units), 0);
  const lotesCompletadosHoy = todayOrders.filter((r) => r.status === "completada").length;

  const ingredients = ingredientsRes.data ?? [];
  const criticalIngredients = ingredients
    .filter((i) => Number(i.stock) < Number(i.stock_min))
    .sort((a, b) => Number(a.stock) / Number(a.stock_min) - Number(b.stock) / Number(b.stock_min));
  const expiringIngredients = ingredients
    .filter((i) => i.expires_on)
    .map((i) => ({ ...i, daysLeft: Math.ceil((new Date(i.expires_on!).getTime() - now.getTime()) / 86400000) }))
    .filter((i) => i.daysLeft >= 0 && i.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const settings = settingsRes.data;
  const goalPct = settings ? (salesThisMonth / Number(settings.monthly_sales_goal)) * 100 : 0;

  type Alert = { color: string; text: React.ReactNode };
  const alerts: Alert[] = [];
  for (const ing of criticalIngredients.slice(0, 2)) {
    alerts.push({
      color: "#C1584A",
      text: (
        <>
          {ing.name} está bajo stock mínimo — <b className="text-nori-text">{Number(ing.stock)}</b> de{" "}
          {Number(ing.stock_min)} {ing.unit}
        </>
      ),
    });
  }
  for (const ing of expiringIngredients.slice(0, 1)) {
    alerts.push({
      color: "#D9A15C",
      text: (
        <>
          {ing.name} caduca en <b className="text-nori-text">{ing.daysLeft} días</b>
        </>
      ),
    });
  }
  alerts.push({
    color: "#8FA8BC",
    text: (
      <>
        Meta mensual de ventas al <b className="text-nori-text">{goalPct.toFixed(0)}%</b>
      </>
    ),
  });

  // ---- 14-day chart ----
  const salesByDay = new Map<string, number>();
  for (const row of salesChartRes.data ?? []) {
    const key = isoDateOnly(new Date(row.created_at));
    salesByDay.set(key, (salesByDay.get(key) ?? 0) + Number(row.units));
  }
  const prodByDay = new Map<string, number>();
  for (const row of productionChartRes.data ?? []) {
    const key = row.produced_at;
    prodByDay.set(key, (prodByDay.get(key) ?? 0) + Number(row.yield_units));
  }
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) days.push(isoDateOnly(daysAgo(i)));
  const rawBars = days.map((d) => ({ sales: salesByDay.get(d) ?? 0, prod: prodByDay.get(d) ?? 0 }));
  const maxVal = Math.max(1, ...rawBars.map((b) => Math.max(b.sales, b.prod)));
  const CHART_HEIGHT = 130;
  const chartBars = rawBars.map((b) => ({
    sales: Math.max(2, (b.sales / maxVal) * CHART_HEIGHT),
    prod: Math.max(2, (b.prod / maxVal) * CHART_HEIGHT),
  }));

  // ---- top products ----
  const productUnits = new Map<string, number>();
  for (const row of topProductsRes.data ?? []) {
    productUnits.set(row.product_name, (productUnits.get(row.product_name) ?? 0) + Number(row.units));
  }
  const productColors = ["#C9834F", "#8FA8BC", "#D9A15C", "#9C978F"];
  const topProducts = Array.from(productUnits.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const topProductsMax = topProducts.length ? topProducts[0][1] : 1;

  // ---- recent activity ----
  type Activity = { time: string; text: React.ReactNode; ts: string };
  const activity: Activity[] = [];
  for (const s of recentSalesRes.data ?? []) {
    activity.push({
      ts: s.created_at,
      time: formatTime(s.created_at),
      text: (
        <>
          Venta registrada · {s.product_name} · {s.client_name}
        </>
      ),
    });
  }
  for (const o of recentOrdersRes.data ?? []) {
    activity.push({
      ts: o.created_at,
      time: formatTime(o.created_at),
      text: (
        <>
          Orden de producción {o.code} ·{" "}
          {o.status === "en_proceso" ? "en proceso" : o.status === "completada" ? "completada" : "cancelada"}
        </>
      ),
    });
  }
  for (const m of recentMovementsRes.data ?? []) {
    activity.push({ ts: m.created_at, time: formatTime(m.created_at), text: m.description });
  }
  activity.sort((a, b) => (a.ts < b.ts ? 1 : -1));
  const recentActivity = activity.slice(0, 4);

  return (
    <div className="p-7 pb-12">
      <div className="mb-[14px] grid grid-cols-4 gap-[14px]">
        <div className="rounded-[14px] border border-nori-border bg-nori-card p-5">
          <div className="mb-[10px] text-xs text-nori-text-muted">Ventas del mes</div>
          <div className="text-[27px] font-bold tracking-[-0.6px]">${formatMoney(salesThisMonth)}</div>
          <div className={`mt-[6px] text-xs ${salesGrowthPct >= 0 ? "text-nori-terracota" : "text-nori-red"}`}>
            {salesGrowthPct >= 0 ? "↑" : "↓"} {Math.abs(salesGrowthPct).toFixed(1)}% vs mes anterior
          </div>
        </div>
        <div className="rounded-[14px] border border-nori-border bg-nori-card p-5">
          <div className="mb-[10px] text-xs text-nori-text-muted">Utilidad</div>
          <div className="text-[27px] font-bold tracking-[-0.6px]">${formatMoney(utilidad)}</div>
          <div className="mt-[6px] text-xs text-nori-text-dim">margen {margin.toFixed(1)}%</div>
        </div>
        <div className="rounded-[14px] border border-nori-border bg-nori-card p-5">
          <div className="mb-[10px] text-xs text-nori-text-muted">Producción de hoy</div>
          <div className="text-[27px] font-bold tracking-[-0.6px]">
            {vasosHoy} <span className="text-sm font-medium text-nori-text-dim">vasos</span>
          </div>
          <div className="mt-[6px] text-xs text-nori-text-dim">{lotesCompletadosHoy} lotes completados</div>
        </div>
        <div className="rounded-[14px] border border-nori-amber/[0.28] bg-nori-amber/[0.06] p-5">
          <div className="mb-[10px] text-xs text-nori-amber">Inventario crítico</div>
          <div className="text-[27px] font-bold tracking-[-0.6px] text-nori-amber">
            {criticalIngredients.length}
          </div>
          <div className="mt-[6px] text-xs text-[#C9A06B]">ingredientes bajo mínimo</div>
        </div>
      </div>

      <div className="mb-[14px] grid grid-cols-[1.7fr_1fr] gap-[14px]">
        <div className="rounded-[14px] border border-nori-border bg-nori-card p-[22px]">
          <div className="mb-[18px] flex items-baseline justify-between">
            <span className="text-[13px] font-semibold">Ventas vs. Producción · 14 días</span>
            <span className="text-[11px] text-nori-text-dim">vasos / día</span>
          </div>
          <div className="flex items-end gap-2" style={{ height: CHART_HEIGHT }}>
            {chartBars.map((bar, i) => (
              <div key={i} className="flex h-full flex-1 flex-col justify-end gap-[3px]">
                <div
                  className="w-full rounded-[3px]"
                  style={{ background: "rgba(143,168,188,0.5)", height: bar.prod }}
                />
                <div className="w-full rounded-[3px] bg-nori-terracota" style={{ height: bar.sales }} />
              </div>
            ))}
          </div>
          <div className="mt-[14px] flex gap-4 text-[11.5px] text-nori-text-muted">
            <span>
              <span className="mr-[6px] inline-block h-2 w-2 rounded-[2px] bg-nori-terracota" />
              Ventas
            </span>
            <span>
              <span
                className="mr-[6px] inline-block h-2 w-2 rounded-[2px]"
                style={{ background: "rgba(143,168,188,0.5)" }}
              />
              Producción
            </span>
          </div>
        </div>

        <div className="rounded-[14px] border border-nori-border bg-nori-card p-[22px]">
          <div className="mb-4 text-[13px] font-semibold">Productos más vendidos</div>
          <div className="flex flex-col gap-[14px]">
            {topProducts.map(([name, units], i) => (
              <div key={name}>
                <div className="mb-[6px] flex justify-between text-[12.5px]">
                  <span>{name}</span>
                  <span className="text-nori-text-muted">{units} vasos</span>
                </div>
                <div className="h-[5px] overflow-hidden rounded-[3px] bg-white/[0.06]">
                  <div
                    className="h-full rounded-[3px]"
                    style={{
                      background: productColors[i % productColors.length],
                      width: `${(units / topProductsMax) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="text-[12.5px] text-nori-text-dim">Sin ventas registradas todavía.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[14px]">
        <div className="rounded-[14px] border border-nori-border bg-nori-card p-5">
          <div className="mb-[14px] text-[13px] font-semibold">Alertas</div>
          <div className="flex flex-col gap-[10px]">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-[10px] text-[12.5px]">
                <span
                  className="mt-[5px] h-[6px] w-[6px] flex-none rounded-full"
                  style={{ background: a.color }}
                />
                <span className="text-nori-text-body">{a.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[14px] border border-nori-border bg-nori-card p-5">
          <div className="mb-[14px] text-[13px] font-semibold">Actividad reciente</div>
          <div className="flex flex-col gap-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex gap-[10px] text-[12.5px] text-nori-text-body">
                <span className="w-11 flex-none font-mono text-[11px] text-nori-text-dim">{a.time}</span>
                {a.text}
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-[12.5px] text-nori-text-dim">Sin actividad todavía.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
