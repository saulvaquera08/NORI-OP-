-- NORI OS — T-008: endurecer RLS para requerir sesión (Supabase Auth)
-- Sustituye las políticas "allow all" (rol público) por políticas solo para
-- `authenticated`. El rol `anon` pierde TODO acceso a datos y RPCs: sin
-- login no se puede leer ni escribir nada, ni desde la UI ni por REST.

do $$
declare
  t text;
begin
  foreach t in array array[
    'company_settings', 'ingredients', 'recipes', 'recipe_versions',
    'recipe_version_ingredients', 'inventory_movements', 'production_orders',
    'sales_channels', 'sales_orders',
    'recipe_ingredients', 'recipe_nutrition', 'recipe_nom051_seals',
    'formulation_rules', 'packaging_items', 'sales_goal_phases'
  ] loop
    execute format('drop policy if exists "allow all - %s" on %I', t, t);
    execute format(
      'create policy "authenticated all - %s" on %I for all to authenticated using (true) with check (true)',
      t, t
    );
  end loop;
end $$;

-- RPCs: solo usuarios con sesión.
revoke execute on function create_production_order(uuid, text, text, numeric, integer, numeric, text, text) from anon;
revoke execute on function register_inventory_movement(uuid, text, numeric, text) from anon;
revoke execute on function set_stock_count(uuid, numeric, text) from anon;
