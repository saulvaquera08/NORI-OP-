-- NORI OS — seed data
-- Mirrors the numbers used in the Claude Design prototype (ingredient prices,
-- the Chocolate Proteico V5 recipe, inventory levels, production orders,
-- etc.) plus generated historical data so dashboard charts/aggregates have
-- something real to show on first run.

insert into company_settings (id, monthly_sales_goal) values (true, 300000)
  on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Ingredients
-- ----------------------------------------------------------------------------
insert into ingredients (id, name, supplier, brand, price_per_kg, unit, protein_g_100g, carbs_g_100g, fat_g_100g, fiber_g_100g, sodium_mg_100g, sugar_g_100g, allergens, shelf_life_days, stock, stock_min, lot_code, location, expires_on) values
('a0000000-0000-4000-8000-000000000001', 'Whey Isolate',          'NutriSupply MX',  'IsoPure',   780,  'kg', 84,  4,   2,    0,   380, 2,   '{leche}',        540, 18,  15, 'L-0198', 'Almacén frío A', null),
('a0000000-0000-4000-8000-000000000002', 'Leche Entera',          'Lácteos del Bajío','LalaPro',  24,   'L',  3.2, 4.8, 3.5,  0,   44,  4.8, '{leche}',        7,   44,  60, 'L-0231', 'Refrigerador 1', now() + interval '2 days'),
('a0000000-0000-4000-8000-000000000003', 'Eritritol',             'DulcePlant',       'Zero',     145,  'kg', 0,   100, 0,    0,   0,   0,   '{}',             730, 6,   12, 'L-0177', 'Almacén seco',   null),
('a0000000-0000-4000-8000-000000000004', 'Cacao en Polvo',        'Cacaotera Real',   'Cacao100', 175,  'kg', 20,  11,  12,   33,  20,  1,   '{}',             365, 15,  8,  'L-0209', 'Almacén seco',   null),
('a0000000-0000-4000-8000-000000000005', 'Crema para Batir',      'Lácteos del Bajío','LalaPro',  90,   'L',  2.1, 3,   36,   0,   38,  3,   '{leche}',        21,  60,  30, 'L-0220', 'Refrigerador 1', null),
('a0000000-0000-4000-8000-000000000006', 'Goma Xantana',          'DulcePlant',       'Texturize',320,  'kg', 0,   0,   0,    100, 0,   0,   '{}',             900, 3,   2,  'L-0140', 'Almacén seco',   null),
('a0000000-0000-4000-8000-000000000007', 'Extracto de Vainilla',  'Aromas Finos',     'PureVain', 1200, 'L',  0,   12,  0,    0,   5,   12,  '{}',             365, 1.2, 2,  'L-0155', 'Almacén seco',   now() + interval '5 days'),
('a0000000-0000-4000-8000-000000000008', 'Fresa Liofilizada',     'FreezeDry Co',     'BerryPure',650,  'kg', 4,   78,  0.5,  20,  9,   60,  '{}',             365, 6,   4,  'L-0165', 'Almacén seco',   null)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Recipes + versions
-- ----------------------------------------------------------------------------
insert into recipes (id, name) values
('b0000000-0000-4000-8000-000000000001', 'Chocolate Proteico'),
('b0000000-0000-4000-8000-000000000002', 'Vainilla Proteica'),
('b0000000-0000-4000-8000-000000000003', 'Fresa Proteica'),
('b0000000-0000-4000-8000-000000000004', 'Mocha Proteico')
on conflict (id) do nothing;

insert into recipe_versions (id, recipe_id, version_number, status, sell_price, serving_size_ml) values
('c0000000-0000-4000-8000-000000000101', 'b0000000-0000-4000-8000-000000000001', 1, 'archivada', 89, 240),
('c0000000-0000-4000-8000-000000000102', 'b0000000-0000-4000-8000-000000000001', 2, 'archivada', 89, 240),
('c0000000-0000-4000-8000-000000000103', 'b0000000-0000-4000-8000-000000000001', 3, 'archivada', 89, 240),
('c0000000-0000-4000-8000-000000000104', 'b0000000-0000-4000-8000-000000000001', 4, 'archivada', 89, 240),
('c0000000-0000-4000-8000-000000000105', 'b0000000-0000-4000-8000-000000000001', 5, 'vigente',   89, 240),
('c0000000-0000-4000-8000-000000000201', 'b0000000-0000-4000-8000-000000000002', 1, 'archivada', 85, 240),
('c0000000-0000-4000-8000-000000000202', 'b0000000-0000-4000-8000-000000000002', 2, 'archivada', 85, 240),
('c0000000-0000-4000-8000-000000000203', 'b0000000-0000-4000-8000-000000000002', 3, 'vigente',   85, 240),
('c0000000-0000-4000-8000-000000000301', 'b0000000-0000-4000-8000-000000000003', 1, 'archivada', 85, 240),
('c0000000-0000-4000-8000-000000000302', 'b0000000-0000-4000-8000-000000000003', 2, 'vigente',   85, 240),
('c0000000-0000-4000-8000-000000000401', 'b0000000-0000-4000-8000-000000000004', 1, 'vigente',   85, 240)
on conflict (id) do nothing;

-- Chocolate Proteico — V1..V5 (V5 matches the prototype's live example exactly)
insert into recipe_version_ingredients (recipe_version_id, ingredient_id, grams) values
('c0000000-0000-4000-8000-000000000101', 'a0000000-0000-4000-8000-000000000001', 220),
('c0000000-0000-4000-8000-000000000101', 'a0000000-0000-4000-8000-000000000002', 2500),
('c0000000-0000-4000-8000-000000000101', 'a0000000-0000-4000-8000-000000000003', 60),
('c0000000-0000-4000-8000-000000000101', 'a0000000-0000-4000-8000-000000000004', 100),

('c0000000-0000-4000-8000-000000000102', 'a0000000-0000-4000-8000-000000000001', 280),
('c0000000-0000-4000-8000-000000000102', 'a0000000-0000-4000-8000-000000000002', 2450),
('c0000000-0000-4000-8000-000000000102', 'a0000000-0000-4000-8000-000000000003', 70),
('c0000000-0000-4000-8000-000000000102', 'a0000000-0000-4000-8000-000000000004', 110),

('c0000000-0000-4000-8000-000000000103', 'a0000000-0000-4000-8000-000000000001', 320),
('c0000000-0000-4000-8000-000000000103', 'a0000000-0000-4000-8000-000000000002', 2420),
('c0000000-0000-4000-8000-000000000103', 'a0000000-0000-4000-8000-000000000003', 75),
('c0000000-0000-4000-8000-000000000103', 'a0000000-0000-4000-8000-000000000004', 115),

('c0000000-0000-4000-8000-000000000104', 'a0000000-0000-4000-8000-000000000001', 350),
('c0000000-0000-4000-8000-000000000104', 'a0000000-0000-4000-8000-000000000002', 2410),
('c0000000-0000-4000-8000-000000000104', 'a0000000-0000-4000-8000-000000000003', 78),
('c0000000-0000-4000-8000-000000000104', 'a0000000-0000-4000-8000-000000000004', 118),

('c0000000-0000-4000-8000-000000000105', 'a0000000-0000-4000-8000-000000000001', 380),
('c0000000-0000-4000-8000-000000000105', 'a0000000-0000-4000-8000-000000000002', 2400),
('c0000000-0000-4000-8000-000000000105', 'a0000000-0000-4000-8000-000000000003', 80),
('c0000000-0000-4000-8000-000000000105', 'a0000000-0000-4000-8000-000000000004', 120)
on conflict do nothing;

-- Vainilla Proteica — V1..V3
insert into recipe_version_ingredients (recipe_version_id, ingredient_id, grams) values
('c0000000-0000-4000-8000-000000000201', 'a0000000-0000-4000-8000-000000000001', 300),
('c0000000-0000-4000-8000-000000000201', 'a0000000-0000-4000-8000-000000000002', 2500),
('c0000000-0000-4000-8000-000000000201', 'a0000000-0000-4000-8000-000000000007', 40),
('c0000000-0000-4000-8000-000000000201', 'a0000000-0000-4000-8000-000000000005', 100),

('c0000000-0000-4000-8000-000000000202', 'a0000000-0000-4000-8000-000000000001', 330),
('c0000000-0000-4000-8000-000000000202', 'a0000000-0000-4000-8000-000000000002', 2450),
('c0000000-0000-4000-8000-000000000202', 'a0000000-0000-4000-8000-000000000007', 45),
('c0000000-0000-4000-8000-000000000202', 'a0000000-0000-4000-8000-000000000005', 110),

('c0000000-0000-4000-8000-000000000203', 'a0000000-0000-4000-8000-000000000001', 360),
('c0000000-0000-4000-8000-000000000203', 'a0000000-0000-4000-8000-000000000002', 2400),
('c0000000-0000-4000-8000-000000000203', 'a0000000-0000-4000-8000-000000000007', 50),
('c0000000-0000-4000-8000-000000000203', 'a0000000-0000-4000-8000-000000000005', 120)
on conflict do nothing;

-- Fresa Proteica — V1..V2
insert into recipe_version_ingredients (recipe_version_id, ingredient_id, grams) values
('c0000000-0000-4000-8000-000000000301', 'a0000000-0000-4000-8000-000000000001', 300),
('c0000000-0000-4000-8000-000000000301', 'a0000000-0000-4000-8000-000000000002', 2400),
('c0000000-0000-4000-8000-000000000301', 'a0000000-0000-4000-8000-000000000008', 150),
('c0000000-0000-4000-8000-000000000301', 'a0000000-0000-4000-8000-000000000005', 150),

('c0000000-0000-4000-8000-000000000302', 'a0000000-0000-4000-8000-000000000001', 340),
('c0000000-0000-4000-8000-000000000302', 'a0000000-0000-4000-8000-000000000002', 2350),
('c0000000-0000-4000-8000-000000000302', 'a0000000-0000-4000-8000-000000000008', 180),
('c0000000-0000-4000-8000-000000000302', 'a0000000-0000-4000-8000-000000000005', 160)
on conflict do nothing;

-- Mocha Proteico — V1
insert into recipe_version_ingredients (recipe_version_id, ingredient_id, grams) values
('c0000000-0000-4000-8000-000000000401', 'a0000000-0000-4000-8000-000000000001', 320),
('c0000000-0000-4000-8000-000000000401', 'a0000000-0000-4000-8000-000000000002', 2450),
('c0000000-0000-4000-8000-000000000401', 'a0000000-0000-4000-8000-000000000004', 90),
('c0000000-0000-4000-8000-000000000401', 'a0000000-0000-4000-8000-000000000007', 30)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Sales channels
-- ----------------------------------------------------------------------------
insert into sales_channels (id, name, color) values
('d0000000-0000-4000-8000-000000000001', 'Venta directa', '#C9834F'),
('d0000000-0000-4000-8000-000000000002', 'Uber Eats',      '#8FA8BC'),
('d0000000-0000-4000-8000-000000000003', 'Rappi',          '#D9A15C'),
('d0000000-0000-4000-8000-000000000004', 'Mayoristas',     '#9C978F')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Inventory movements — recent history matching the prototype's list
-- ----------------------------------------------------------------------------
insert into inventory_movements (ingredient_id, type, quantity, unit, description, reference, created_at) values
('a0000000-0000-4000-8000-000000000001', 'entrada', 20,    'kg', 'Recepción de compra · Whey Isolate',        null,     now() - interval '2 hours'),
('a0000000-0000-4000-8000-000000000001', 'salida',  -0.38, 'kg', 'Consumo en OP-0142 · Chocolate V5',         'OP-0142', now() - interval '5 hours'),
('a0000000-0000-4000-8000-000000000004', 'ajuste',  -0.4,  'kg', 'Ajuste por conteo físico · Cacao',          null,     now() - interval '1 day'),
('a0000000-0000-4000-8000-000000000007', 'salida',  -2.1,  'L',  'Consumo en OP-0141 · Vainilla V3',          'OP-0141', now() - interval '2 days'),
('a0000000-0000-4000-8000-000000000002', 'entrada', 200,   'L',  'Recepción de compra · Leche Entera',        null,     now() - interval '3 days');

-- ----------------------------------------------------------------------------
-- Production orders — 20 days of generated history, then the 4 canonical
-- orders that match the prototype narrative exactly.
-- ----------------------------------------------------------------------------
do $$
declare
  d int;
  day_date date;
  code_num int := 118;
  recipe_versions_pool uuid[];
  operators text[] := array['Luis Ramírez', 'Ana Torres'];
  v_recipe_version uuid;
  v_yield int;
  v_merma numeric;
  v_cost numeric;
begin
  select array_agg(id) into recipe_versions_pool
    from recipe_versions where status in ('vigente', 'archivada');

  for d in 0..19 loop
    day_date := current_date - (19 - d);
    if random() < 0.75 then
      v_recipe_version := recipe_versions_pool[1 + floor(random() * array_length(recipe_versions_pool, 1))::int];
      v_yield := 150 + floor(random() * 200)::int;
      v_merma := round((1 + random() * 3)::numeric, 1);
      v_cost := round((28 + random() * 12)::numeric, 2);
      code_num := code_num + 1;
      insert into production_orders (
        code, recipe_version_id, operator, status, lot_code,
        temperature_c, yield_units, merma_pct, cost_per_unit_snapshot,
        notes, produced_at, created_at
      ) values (
        'OP-' || lpad(code_num::text, 4, '0'),
        v_recipe_version,
        operators[1 + floor(random() * 2)::int],
        'completada',
        'L-' || lpad((700 + code_num)::text, 4, '0'),
        -18 - floor(random() * 2)::int,
        v_yield,
        v_merma,
        v_cost,
        'Lote dentro de parámetros estándar de calidad.',
        day_date,
        day_date + interval '9 hours'
      );
    end if;
  end loop;
end $$;

insert into production_orders (code, recipe_version_id, operator, status, lot_code, temperature_c, yield_units, merma_pct, cost_per_unit_snapshot, notes, produced_at, created_at) values
('OP-0139', 'c0000000-0000-4000-8000-000000000401', 'Ana Torres',    'cancelada',   'L-0688', null, 0,   0,   null,  'Cancelada por falta de café liofilizado en inventario.',                          current_date - 7, now() - interval '7 days'),
('OP-0140', 'c0000000-0000-4000-8000-000000000302', 'Luis Ramírez',  'completada',  'L-0702', -18,  210, 3.2, 31.40, 'Merma ligeramente alta por derrame en envasado — revisar boquilla.',              current_date - 4, now() - interval '4 days'),
('OP-0141', 'c0000000-0000-4000-8000-000000000203', 'Ana Torres',    'completada',  'L-0714', -19,  288, 1.4, 33.85, 'Rendimiento sobre lo esperado. Textura aprobada por control de calidad.',         current_date - 2, now() - interval '2 days'),
('OP-0142', 'c0000000-0000-4000-8000-000000000105', 'Luis Ramírez',  'en_proceso',  'L-0721', -18,  340, 2.1, 35.15, 'Batido homogéneo, sin grumos. Congelación dentro del rango esperado.',            current_date,     now() - interval '5 hours')
on conflict (code) do nothing;

-- ----------------------------------------------------------------------------
-- Sales orders — 30 days of generated history, then the 5 canonical "recent"
-- orders shown at the top of the prototype's Ventas screen.
-- ----------------------------------------------------------------------------
do $$
declare
  d int;
  day_date date;
  n int;
  i int;
  k int;
  channel_names text[] := array['Venta directa', 'Uber Eats', 'Rappi', 'Mayoristas'];
  channel_weights numeric[] := array[0.45, 0.27, 0.19, 0.09];
  product_names text[] := array['Chocolate Proteico', 'Vainilla Proteica', 'Fresa Proteica', 'Mocha Proteico'];
  product_weights numeric[] := array[0.39, 0.28, 0.20, 0.13];
  payment_pool text[] := array['tarjeta', 'tarjeta', 'tarjeta', 'efectivo', 'transferencia'];
  client_pool text[] := array['Javier Peña', 'Renata Cortés', 'Mariana Tello', 'Diego López', 'Sofía Ibarra', 'Carlos Medina', 'Fernanda Ruiz', 'Grupo Sano Mayoreo', 'Paola Cervantes', 'Andrés Villalobos', 'Regina Ponce', 'Héctor Salas'];
  v_channel_id uuid;
  v_channel_name text;
  v_product text;
  v_units int;
  v_price numeric;
  r numeric;
  cum numeric;
begin
  for d in 0..29 loop
    day_date := current_date - (29 - d);
    n := 6 + floor(random() * 10)::int + d / 3;
    for i in 1..n loop
      r := random(); cum := 0; v_channel_name := channel_names[1];
      for k in 1..4 loop
        cum := cum + channel_weights[k];
        if r <= cum then v_channel_name := channel_names[k]; exit; end if;
      end loop;
      select id into v_channel_id from sales_channels where name = v_channel_name;

      r := random(); cum := 0; v_product := product_names[1];
      for k in 1..4 loop
        cum := cum + product_weights[k];
        if r <= cum then v_product := product_names[k]; exit; end if;
      end loop;

      if v_channel_name = 'Mayoristas' then
        v_units := 20 + floor(random() * 60)::int;
        v_price := 78 + floor(random() * 10)::int;
      else
        v_units := 1 + floor(random() * 5)::int;
        v_price := 85 + floor(random() * 10)::int;
      end if;

      insert into sales_orders (client_name, product_name, channel_id, payment_method, units, unit_price, status, created_at)
      values (
        client_pool[1 + floor(random() * array_length(client_pool, 1))::int],
        v_product, v_channel_id,
        payment_pool[1 + floor(random() * array_length(payment_pool, 1))::int],
        v_units, v_price,
        case when random() < 0.08 then 'pendiente' else 'pagado' end,
        day_date + (random() * interval '20 hours') + interval '7 hours'
      );
    end loop;
  end loop;
end $$;

insert into sales_orders (client_name, product_name, channel_id, payment_method, units, unit_price, status, created_at) values
('Javier Peña',          'Chocolate Proteico', 'd0000000-0000-4000-8000-000000000002', 'tarjeta',       3,  89, 'pagado',    now() - interval '9 minutes'),
('Renata Cortés',        'Vainilla Proteica',  'd0000000-0000-4000-8000-000000000001', 'efectivo',      2,  89, 'pagado',    now() - interval '18 minutes'),
('Grupo Sano Mayoreo',   'Chocolate Proteico', 'd0000000-0000-4000-8000-000000000004', 'transferencia', 50, 84, 'pendiente', now() - interval '32 minutes'),
('Mariana Tello',        'Fresa Proteica',     'd0000000-0000-4000-8000-000000000003', 'tarjeta',       1,  89, 'pagado',    now() - interval '47 minutes'),
('Diego López',          'Chocolate Proteico', 'd0000000-0000-4000-8000-000000000001', 'tarjeta',       2,  89, 'pagado',    now() - interval '1 hour');

-- ----------------------------------------------------------------------------
-- NORI AI — chat history
-- ----------------------------------------------------------------------------
insert into chat_conversations (id, title, created_at) values
('e0000000-0000-4000-8000-000000000001', 'Receta con menor costo',          now()),
('e0000000-0000-4000-8000-000000000002', 'Proveedor conveniente lácteos',   now() - interval '1 day'),
('e0000000-0000-4000-8000-000000000003', 'Proyección de ventas Q3',         now() - interval '2 days'),
('e0000000-0000-4000-8000-000000000004', 'Optimizar Vainilla V3',           now() - interval '3 days'),
('e0000000-0000-4000-8000-000000000005', 'Sellos NOM Fresa V2',             now() - interval '4 days');

insert into chat_messages (conversation_id, role, content, created_at) values
('e0000000-0000-4000-8000-000000000001', 'user',      '¿Qué pasa si reduzco el eritritol 20g y subo la leche 20g en Chocolate V5?', now()),
('e0000000-0000-4000-8000-000000000001', 'assistant', E'El costo del lote baja $2.30 y el peso final no cambia.\nProteína por vaso baja de 38.2g a 37.6g — sigue arriba de tu mínimo de 35g.\nAzúcar por vaso sube de 10.5g a 10.9g, todavía sin activar sello NOM.\n\n¿Quieres que genere la V6 con este ajuste?', now() + interval '1 second'),
('e0000000-0000-4000-8000-000000000002', 'user',      '¿Qué proveedor de lácteos conviene más ahora mismo?', now() - interval '1 day'),
('e0000000-0000-4000-8000-000000000002', 'assistant', 'Lácteos del Bajío sigue siendo el más competitivo en leche entera y crema para batir dentro de tu catálogo actual de proveedores.', now() - interval '1 day' + interval '1 second'),
('e0000000-0000-4000-8000-000000000003', 'user',      'Resume la proyección de ventas para el próximo trimestre.', now() - interval '2 days'),
('e0000000-0000-4000-8000-000000000003', 'assistant', 'Con la tendencia actual, Q3 cerraría entre 5-8% por arriba de Q2 si el canal de Uber Eats mantiene su ritmo de crecimiento.', now() - interval '2 days' + interval '1 second'),
('e0000000-0000-4000-8000-000000000004', 'user',      '¿Cómo puedo optimizar el costo de Vainilla V3 sin bajar proteína?', now() - interval '3 days'),
('e0000000-0000-4000-8000-000000000004', 'assistant', 'Sustituir parte de la crema para batir por leche entera reduce el costo del lote sin afectar significativamente la proteína por vaso.', now() - interval '3 days' + interval '1 second'),
('e0000000-0000-4000-8000-000000000005', 'user',      '¿Fresa V2 activa algún sello NOM-051?', now() - interval '4 days'),
('e0000000-0000-4000-8000-000000000005', 'assistant', 'Fresa V2 está cerca del límite de azúcares por el contenido natural de la fresa liofilizada — vale la pena validarlo en laboratorio antes de imprimir empaque.', now() - interval '4 days' + interval '1 second');
