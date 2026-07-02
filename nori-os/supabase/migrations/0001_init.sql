-- NORI OS — core schema
-- Note: no authentication/roles system exists yet (deferred per product spec: "Más
-- adelante existirán permisos por usuario"). RLS is enabled with permissive policies
-- so the app works today with the anon key. Before exposing this to real users,
-- replace the "allow all" policies below with policies scoped to an auth.uid()/role.

create extension if not exists pgcrypto;

-- ============================================================================
-- company_settings — single-row table for org-wide config (sales goals, etc.)
-- ============================================================================
create table company_settings (
  id boolean primary key default true check (id),
  monthly_sales_goal numeric(12, 2) not null default 300000
);

-- ============================================================================
-- ingredients — master ingredient catalog
-- ============================================================================
create table ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  supplier text,
  brand text,
  price_per_kg numeric(10, 2) not null default 0,
  unit text not null default 'kg' check (unit in ('kg', 'L')),
  protein_g_100g numeric(6, 2) not null default 0,
  carbs_g_100g numeric(6, 2) not null default 0,
  fat_g_100g numeric(6, 2) not null default 0,
  fiber_g_100g numeric(6, 2) not null default 0,
  sodium_mg_100g numeric(6, 2) not null default 0,
  sugar_g_100g numeric(6, 2) not null default 0,
  allergens text[] not null default '{}',
  shelf_life_days integer,
  stock numeric(10, 2) not null default 0,
  stock_min numeric(10, 2) not null default 0,
  lot_code text,
  location text,
  expires_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- recipes / recipe_versions / recipe_version_ingredients
-- Versions are immutable once created — never deleted, only superseded.
-- ============================================================================
create table recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table recipe_versions (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  version_number integer not null,
  status text not null default 'borrador' check (status in ('vigente', 'borrador', 'archivada')),
  sell_price numeric(10, 2) not null default 0,
  serving_size_ml numeric(10, 2) not null default 240,
  created_at timestamptz not null default now(),
  unique (recipe_id, version_number)
);

-- only one "vigente" (current/active) version per recipe at a time
create unique index recipe_versions_one_vigente on recipe_versions (recipe_id) where status = 'vigente';

create table recipe_version_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_version_id uuid not null references recipe_versions(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete restrict,
  grams numeric(10, 2) not null default 0,
  unique (recipe_version_id, ingredient_id)
);

create index recipe_version_ingredients_version_idx on recipe_version_ingredients (recipe_version_id);

-- ============================================================================
-- inventory_movements — append-only ledger (entrada / salida / ajuste)
-- ============================================================================
create table inventory_movements (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  type text not null check (type in ('entrada', 'salida', 'ajuste')),
  quantity numeric(10, 2) not null,
  unit text not null,
  description text not null,
  reference text,
  created_at timestamptz not null default now()
);

create index inventory_movements_ingredient_idx on inventory_movements (ingredient_id, created_at desc);
create index inventory_movements_created_idx on inventory_movements (created_at desc);

-- ============================================================================
-- production_orders — one row per batch run
-- ============================================================================
create table production_orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  recipe_version_id uuid not null references recipe_versions(id),
  operator text not null,
  status text not null default 'en_proceso' check (status in ('en_proceso', 'completada', 'cancelada')),
  lot_code text,
  temperature_c numeric(5, 2),
  yield_units integer not null default 0,
  merma_pct numeric(5, 2) not null default 0,
  cost_per_unit_snapshot numeric(10, 2),
  notes text,
  photos text[] not null default '{}',
  produced_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index production_orders_created_idx on production_orders (created_at desc);
create index production_orders_produced_at_idx on production_orders (produced_at desc);

-- ============================================================================
-- sales_channels / sales_orders
-- ============================================================================
create table sales_channels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null
);

create table sales_orders (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  product_name text not null,
  channel_id uuid not null references sales_channels(id),
  payment_method text not null check (payment_method in ('tarjeta', 'efectivo', 'transferencia')),
  units integer not null default 1,
  unit_price numeric(10, 2) not null default 0,
  amount numeric(12, 2) generated always as (units * unit_price) stored,
  status text not null default 'pendiente' check (status in ('pagado', 'pendiente')),
  created_at timestamptz not null default now()
);

create index sales_orders_created_idx on sales_orders (created_at desc);
create index sales_orders_channel_idx on sales_orders (channel_id);
create index sales_orders_client_idx on sales_orders (client_name);

-- ============================================================================
-- NORI AI chat
-- ============================================================================
create table chat_conversations (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Nueva conversación',
  created_at timestamptz not null default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references chat_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_conversation_idx on chat_messages (conversation_id, created_at);

-- ============================================================================
-- RPC: create_production_order
-- Creates a batch, snapshots its per-unit cost from the recipe version's
-- current ingredient costs, and automatically discounts inventory —
-- mirroring the "fabricar lote -> descuenta inventario -> calcula costo"
-- cascade from the product spec.
-- ============================================================================
create or replace function create_production_order(
  p_recipe_version_id uuid,
  p_operator text,
  p_lot_code text,
  p_temperature_c numeric,
  p_yield_units integer,
  p_merma_pct numeric,
  p_notes text,
  p_status text default 'en_proceso'
)
returns production_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_next_seq integer;
  v_total_cost numeric := 0;
  v_cost_per_unit numeric := 0;
  v_order production_orders;
  r record;
begin
  select coalesce(max(nullif(regexp_replace(code, '\D', '', 'g'), '')::integer), 0) + 1
    into v_next_seq
    from production_orders;
  v_code := 'OP-' || lpad(v_next_seq::text, 4, '0');

  for r in
    select rvi.ingredient_id, rvi.grams, i.price_per_kg, i.unit
    from recipe_version_ingredients rvi
    join ingredients i on i.id = rvi.ingredient_id
    where rvi.recipe_version_id = p_recipe_version_id
  loop
    v_total_cost := v_total_cost + (r.grams * r.price_per_kg / 1000);

    update ingredients
      set stock = stock - (r.grams / 1000.0), updated_at = now()
      where id = r.ingredient_id;

    insert into inventory_movements (ingredient_id, type, quantity, unit, description, reference)
    values (r.ingredient_id, 'salida', -(r.grams / 1000.0), r.unit, 'Consumo en ' || v_code, v_code);
  end loop;

  if p_yield_units > 0 then
    v_cost_per_unit := v_total_cost / p_yield_units;
  end if;

  insert into production_orders (
    code, recipe_version_id, operator, status, lot_code,
    temperature_c, yield_units, merma_pct, cost_per_unit_snapshot, notes
  )
  values (
    v_code, p_recipe_version_id, p_operator, coalesce(p_status, 'en_proceso'), p_lot_code,
    p_temperature_c, p_yield_units, p_merma_pct, v_cost_per_unit, p_notes
  )
  returning * into v_order;

  return v_order;
end;
$$;

grant execute on function create_production_order to anon, authenticated;

-- ============================================================================
-- RLS — enabled on every table. Policies are permissive ("allow all") because
-- there is no auth/roles layer yet. Tighten these once user accounts exist.
-- ============================================================================
alter table company_settings enable row level security;
alter table ingredients enable row level security;
alter table recipes enable row level security;
alter table recipe_versions enable row level security;
alter table recipe_version_ingredients enable row level security;
alter table inventory_movements enable row level security;
alter table production_orders enable row level security;
alter table sales_channels enable row level security;
alter table sales_orders enable row level security;
alter table chat_conversations enable row level security;
alter table chat_messages enable row level security;

create policy "allow all - company_settings" on company_settings for all using (true) with check (true);
create policy "allow all - ingredients" on ingredients for all using (true) with check (true);
create policy "allow all - recipes" on recipes for all using (true) with check (true);
create policy "allow all - recipe_versions" on recipe_versions for all using (true) with check (true);
create policy "allow all - recipe_version_ingredients" on recipe_version_ingredients for all using (true) with check (true);
create policy "allow all - inventory_movements" on inventory_movements for all using (true) with check (true);
create policy "allow all - production_orders" on production_orders for all using (true) with check (true);
create policy "allow all - sales_channels" on sales_channels for all using (true) with check (true);
create policy "allow all - sales_orders" on sales_orders for all using (true) with check (true);
create policy "allow all - chat_conversations" on chat_conversations for all using (true) with check (true);
create policy "allow all - chat_messages" on chat_messages for all using (true) with check (true);
