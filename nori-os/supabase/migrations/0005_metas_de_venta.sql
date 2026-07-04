-- NORI OS — metas de venta por fase (T-005)
-- Fuente: plan de metas del fundador (2026-07-04). La restricción de
-- capacidad es la Ninja Creami: 15-25 pintas/semana → techo ~100 pintas/mes
-- en la fase actual; fases 5-6 requieren la Whynter.
-- Precio wholesale de referencia: $130/pinta.

create table sales_goal_phases (
  id uuid primary key default gen_random_uuid(),
  phase_order integer not null unique,
  months_label text not null,
  pintas_min integer not null,
  pintas_max integer not null,
  channel text not null,
  revenue_min numeric(12, 2) not null,
  revenue_max numeric(12, 2) not null,
  contribution_min numeric(12, 2) not null,
  contribution_max numeric(12, 2) not null,
  requires text,
  created_at timestamptz not null default now()
);

alter table sales_goal_phases enable row level security;
create policy "allow all - sales_goal_phases" on sales_goal_phases for all using (true) with check (true);

insert into sales_goal_phases (phase_order, months_label, pintas_min, pintas_max, channel, revenue_min, revenue_max, contribution_min, contribution_max, requires) values
(1, 'Mes 1-2', 80, 100,  '2-3 gyms consignación',        10400, 13000, 4800, 6000, null),
(2, 'Mes 3-4', 150, 200, '4-5 gyms + venta directa',     19500, 26000, 9000, 12000, null),
(3, 'Mes 5-6', 280, 350, '6-8 gyms',                     36400, 45500, 16800, 21000, 'Whynter ICM-200LS');

-- Meta mensual vigente para el dashboard: techo de la fase actual (Mes 1-2),
-- 100 pintas × $130 wholesale = $13,000. Ajustar al avanzar de fase.
insert into company_settings (id, monthly_sales_goal) values (true, 13000)
on conflict (id) do update set monthly_sales_goal = excluded.monthly_sales_goal;
