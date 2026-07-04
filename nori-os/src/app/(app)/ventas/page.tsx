import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/nori/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupRequired } from "@/components/nori/setup-required";
import { NuevaVentaForm } from "@/app/(app)/ventas/nueva-venta-form";
import { VentaRowActions } from "@/app/(app)/ventas/venta-row-actions";

export const dynamic = "force-dynamic";

const PAYMENT_LABEL: Record<string, string> = {
  tarjeta: "Tarjeta",
  efectivo: "Efectivo",
  transferencia: "Transferencia",
};
const PAYMENT_COLOR: Record<string, string> = {
  tarjeta: "#C9834F",
  efectivo: "#8FA8BC",
  transferencia: "#D9A15C",
};
const AVATAR_COLORS = ["#C9834F", "#8FA8BC", "#D9A15C", "#C1584A"];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function startOfMonthUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export default async function VentasPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const supabase = await createClient();
  const now = new Date();
  const monthStart = startOfMonthUTC(now);

  const [ordersRes, channelsRes, recentRes, priorClientsRes] = await Promise.all([
    supabase
      .from("sales_orders")
      .select("amount, client_name, channel_id, payment_method")
      .gte("created_at", monthStart.toISOString()),
    supabase.from("sales_channels").select("*"),
    supabase
      .from("sales_orders")
      .select("*, channel:sales_channels(name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("sales_orders").select("client_name").lt("created_at", monthStart.toISOString()),
  ]);

  const orders = ordersRes.data ?? [];
  const channels = channelsRes.data ?? [];
  const channelById = new Map(channels.map((c) => [c.id, c]));

  const ingresos = orders.reduce((a, o) => a + Number(o.amount), 0);
  const ticketPromedio = orders.length ? ingresos / orders.length : 0;
  const pedidos = orders.length;

  const priorClients = new Set((priorClientsRes.data ?? []).map((o) => o.client_name));
  const clientesNuevos = new Set(
    orders.map((o) => o.client_name).filter((name) => !priorClients.has(name))
  ).size;

  const byChannel = new Map<string, number>();
  for (const o of orders) byChannel.set(o.channel_id, (byChannel.get(o.channel_id) ?? 0) + Number(o.amount));
  const channelBreakdown = channels
    .map((c) => ({ name: c.name, color: c.color, amount: byChannel.get(c.id) ?? 0 }))
    .sort((a, b) => b.amount - a.amount);
  const channelMax = Math.max(1, ...channelBreakdown.map((c) => c.amount));

  const byPayment = new Map<string, number>();
  for (const o of orders) byPayment.set(o.payment_method, (byPayment.get(o.payment_method) ?? 0) + Number(o.amount));
  const paymentBreakdown = Object.keys(PAYMENT_LABEL)
    .map((key) => ({
      key,
      name: PAYMENT_LABEL[key],
      color: PAYMENT_COLOR[key],
      amount: byPayment.get(key) ?? 0,
    }))
    .sort((a, b) => b.amount - a.amount);
  const paymentTotal = Math.max(1, paymentBreakdown.reduce((a, p) => a + p.amount, 0));

  return (
    <div className="p-4 md:p-7">
      <NuevaVentaForm
        channels={channels.map((c) => ({ id: c.id, name: c.name }))}
        products={["Vainilla", "Chocolate", "Cajeta", "Plátano", "Cookies & Cream"]}
      />
      <div className="mb-[14px] grid grid-cols-2 gap-3 md:gap-[14px] lg:grid-cols-4">
        <div className="rounded-[14px] border border-nori-border bg-nori-card p-[18px]">
          <div className="mb-2 text-xs text-nori-text-muted">Ingresos del mes</div>
          <div className="text-[23px] font-bold">${formatMoney(ingresos)}</div>
        </div>
        <div className="rounded-[14px] border border-nori-border bg-nori-card p-[18px]">
          <div className="mb-2 text-xs text-nori-text-muted">Ticket promedio</div>
          <div className="text-[23px] font-bold">${formatMoney(ticketPromedio)}</div>
        </div>
        <div className="rounded-[14px] border border-nori-border bg-nori-card p-[18px]">
          <div className="mb-2 text-xs text-nori-text-muted">Pedidos</div>
          <div className="text-[23px] font-bold">{pedidos.toLocaleString("es-MX")}</div>
        </div>
        <div className="rounded-[14px] border border-nori-border bg-nori-card p-[18px]">
          <div className="mb-2 text-xs text-nori-text-muted">Clientes nuevos</div>
          <div className="text-[23px] font-bold">{clientesNuevos}</div>
        </div>
      </div>

      <div className="mb-[14px] grid grid-cols-1 gap-[14px] lg:grid-cols-2">
        <div className="rounded-[14px] border border-nori-border bg-nori-card p-5">
          <div className="mb-4 text-[13px] font-semibold">Ingresos por canal</div>
          <div className="flex flex-col gap-3">
            {channelBreakdown.map((c) => (
              <div key={c.name}>
                <div className="mb-[6px] flex justify-between text-[12.5px]">
                  <span>{c.name}</span>
                  <span className="text-nori-text-muted">${formatMoney(c.amount)}</span>
                </div>
                <div className="h-[6px] rounded-[3px] bg-white/[0.06]">
                  <div
                    className="h-full rounded-[3px]"
                    style={{ background: c.color, width: `${(c.amount / channelMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[14px] border border-nori-border bg-nori-card p-5">
          <div className="mb-4 text-[13px] font-semibold">Métodos de pago</div>
          <div className="flex flex-col gap-3">
            {paymentBreakdown.map((p) => {
              const pct = (p.amount / paymentTotal) * 100;
              return (
                <div key={p.key}>
                  <div className="mb-[6px] flex justify-between text-[12.5px]">
                    <span>{p.name}</span>
                    <span className="text-nori-text-muted">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-[6px] rounded-[3px] bg-white/[0.06]">
                    <div className="h-full rounded-[3px]" style={{ background: p.color, width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-nori-border bg-nori-card p-5">
        <div className="mb-[14px] text-[13px] font-semibold">Pedidos recientes</div>
        <div className="flex flex-col gap-[2px] overflow-x-auto">
          {(recentRes.data ?? []).map((ro, i) => (
            <div
              key={ro.id}
              className="grid min-w-[520px] grid-cols-[32px_1.2fr_0.8fr_0.6fr_0.7fr_52px] items-center gap-3 border-b border-white/[0.05] px-[6px] py-[10px] text-[12.5px]"
            >
              <span
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[10.5px] font-semibold text-[#15181C]"
                style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
              >
                {initials(ro.client_name)}
              </span>
              <span>{ro.client_name}</span>
              <span className="text-nori-text-muted">
                {(ro as unknown as { channel: { name: string } | null }).channel?.name ??
                  channelById.get(ro.channel_id)?.name}
              </span>
              <span className="font-mono">${formatMoney(Number(ro.amount))}</span>
              <span className={ro.status === "pagado" ? "text-nori-terracota" : "text-nori-amber"}>
                {ro.status === "pagado" ? "Pagado" : "Pendiente"}
              </span>
              <VentaRowActions saleId={ro.id} status={ro.status as "pagado" | "pendiente"} />
            </div>
          ))}
          {(recentRes.data ?? []).length === 0 && (
            <div className="py-2 text-[12.5px] text-nori-text-dim">
              Sin ventas registradas todavía — usa “+ Registrar venta”.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
