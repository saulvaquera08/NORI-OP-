-- NORI OS — catálogo real de ingredientes + packaging (T-004)
-- Fuente de precios: tabla de costos por pinta proporcionada por el fundador
-- (2026-07-04). Los precios por kg/L derivan del "costo unitario" de esa tabla
-- (p. ej. Isopure $1.13/g → $1,130/kg, cifra citada textualmente por el
-- fundador: "los $1,130/kg que pagas hoy").
--
-- ⚠ MACROS POR 100 g: el fundador NO los proporcionó. Se usan valores de
-- tablas estándar de composición de alimentos (misma metodología declarada
-- para el recetario de marca). PENDIENTES DE VALIDACIÓN antes de usar el
-- formulador para etiquetado. Stock y stock mínimo en 0 hasta captura real.
--
-- ⚠ ALULOSA y GLICERINA: sus carbohidratos no son metabolizables (alulosa) o
-- aportan ~4.3 kcal/g (glicerina); recipe-calc hoy asume 4 kcal/g para todo
-- carbohidrato → las kcal del formulador estarán sobreestimadas hasta
-- resolver T-012 (campo de carbohidratos no metabolizables).

-- ----------------------------------------------------------------------------
-- packaging_items — costos de empaque por volumen (rangos fieles a la fuente)
-- ----------------------------------------------------------------------------
create table packaging_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cost_low_volume_min numeric(10, 2),
  cost_low_volume_max numeric(10, 2),
  cost_high_volume_min numeric(10, 2),
  cost_high_volume_max numeric(10, 2),
  high_volume_threshold text,
  notes text,
  created_at timestamptz not null default now()
);

alter table packaging_items enable row level security;
create policy "allow all - packaging_items" on packaging_items for all using (true) with check (true);

insert into packaging_items (name, cost_low_volume_min, cost_low_volume_max, cost_high_volume_min, cost_high_volume_max, high_volume_threshold) values
('Pinta 475 ml + tapa', 10, 14, 6, 8, '500+ piezas'),
('Etiqueta / sleeve',    5,  8, 3, 4, '500+ piezas');

-- ----------------------------------------------------------------------------
-- Ingredientes reales (precios del fundador; macros de tabla estándar)
-- ----------------------------------------------------------------------------
insert into ingredients (id, name, supplier, brand, price_per_kg, unit, protein_g_100g, carbs_g_100g, fat_g_100g, fiber_g_100g, sodium_mg_100g, sugar_g_100g, stock, stock_min) values
-- Isopure: $1,639/3 lb (MercadoLibre) → ~$1.13-1.20/g; el fundador cita $1,130/kg.
-- Macros estándar WPI sin sabor: ~25 g proteína por scoop de 28 g; sodio ~160 mg/scoop (dato del fundador en reglas de formulación).
('a1000000-0000-4000-8000-000000000001', 'Isopure WPI sin sabor', 'MercadoLibre', 'Isopure', 1130, 'kg', 89, 0, 0.5, 0, 571, 0, 0, 0),
-- Leche: ~$27-30/L súper → costo unitario $0.028/ml = $28/L. Macros de etiqueta estándar leche descremada.
('a1000000-0000-4000-8000-000000000002', 'Leche descremada LALA Light 0%', 'Súper', 'LALA', 28, 'L', 3.1, 4.9, 0.2, 0, 50, 4.9, 0, 0),
-- Alulosa: retail $250/kg (Granel Vital). Carbohidrato NO metabolizable (ver T-012).
('a1000000-0000-4000-8000-000000000003', 'Alulosa', 'Granel Vital', 'Natural Wisdom', 250, 'kg', 0, 100, 0, 0, 0, 0, 0, 0),
-- Aceite alto oleico: $70-90/L → costo unitario $0.08/g = $80/kg.
('a1000000-0000-4000-8000-000000000004', 'Aceite alto oleico (girasol o aguacate)', null, null, 80, 'L', 0, 0, 100, 0, 0, 0, 0, 0),
-- Lecitina de girasol: $350-450/kg → costo unitario $0.40/g = $400/kg.
('a1000000-0000-4000-8000-000000000005', 'Lecitina de girasol', null, null, 400, 'kg', 0, 0, 92, 0, 0, 0, 0, 0),
-- Goma xantana: $280-400/kg → costo unitario $0.35/g = $350/kg. Fibra soluble.
('a1000000-0000-4000-8000-000000000006', 'Goma xantana', null, null, 350, 'kg', 0, 0, 0, 100, 0, 0, 0, 0),
-- Vainilla Molina: $60-70/500 ml → costo unitario $0.13/ml = $130/L. Macros estándar extracto de vainilla.
('a1000000-0000-4000-8000-000000000007', 'Vainilla Molina', null, 'Molina', 130, 'L', 0.1, 12.7, 0.1, 0, 9, 12.7, 0, 0),
-- Glicerina grado alimenticio: $120-150/L → costo unitario $0.13/g = $130/kg. Poliol (~4.3 kcal/g reales, ver T-012).
('a1000000-0000-4000-8000-000000000008', 'Glicerina vegetal (USP grado alimenticio)', null, null, 130, 'kg', 0, 100, 0, 0, 0, 0, 0, 0)
on conflict (id) do nothing;
