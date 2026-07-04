-- NORI OS — T-018: la Base V6 Simple · Ninja Creami entra al motor de
-- versiones del formulador, ligada al catálogo real de ingredientes.
-- Cantidades = receta oficial del fundador. Leche 300 ml→300 g y vainilla
-- 10 ml→10 g (aproximación densidad≈1, ver decisions D-013).
-- sell_price = $130 wholesale · porción = pinta 475 ml.

insert into recipe_versions (id, recipe_id, version_number, status, sell_price, serving_size_ml) values
('c1000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000001', 6, 'vigente', 130, 475)
on conflict (id) do nothing;

insert into recipe_version_ingredients (recipe_version_id, ingredient_id, grams) values
('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002', 300),
('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 28),
('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000003', 45),
('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000004', 13),
('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000005', 2),
('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000006', 1.5),
('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000007', 10),
('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000008', 5)
on conflict do nothing;
