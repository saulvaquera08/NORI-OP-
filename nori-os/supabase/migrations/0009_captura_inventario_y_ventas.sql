-- NORI OS — T-015/T-016: captura de inventario y ventas
-- Canales reales según el plan de metas del fundador (gyms consignación +
-- venta directa). Se pueden agregar más desde SQL cuando existan.

insert into sales_channels (id, name, color) values
('d1000000-0000-4000-8000-000000000001', 'Venta directa', '#C9834F'),
('d1000000-0000-4000-8000-000000000002', 'Gyms (consignación)', '#8FA8BC')
on conflict (name) do nothing;

-- ----------------------------------------------------------------------------
-- RPC: register_inventory_movement — entrada/salida manual.
-- Inserta el movimiento en el ledger y actualiza el stock, atómico.
-- ----------------------------------------------------------------------------
create or replace function register_inventory_movement(
  p_ingredient_id uuid,
  p_type text,
  p_quantity numeric,
  p_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_unit text;
  v_delta numeric;
begin
  if p_type not in ('entrada', 'salida') then
    raise exception 'Tipo inválido: %', p_type;
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'La cantidad debe ser mayor a cero';
  end if;

  select unit into v_unit from ingredients where id = p_ingredient_id;
  if v_unit is null then
    raise exception 'Ingrediente no encontrado';
  end if;

  v_delta := case when p_type = 'entrada' then p_quantity else -p_quantity end;

  update ingredients set stock = stock + v_delta, updated_at = now()
    where id = p_ingredient_id;

  insert into inventory_movements (ingredient_id, type, quantity, unit, description)
  values (p_ingredient_id, p_type, v_delta, v_unit,
          coalesce(nullif(trim(p_note), ''),
                   case when p_type = 'entrada' then 'Entrada manual' else 'Salida manual' end));
end;
$$;

grant execute on function register_inventory_movement to anon, authenticated;

-- ----------------------------------------------------------------------------
-- RPC: set_stock_count — "apuntar el inventario actual" (conteo físico).
-- Fija el stock al valor contado y registra la diferencia como ajuste.
-- ----------------------------------------------------------------------------
create or replace function set_stock_count(
  p_ingredient_id uuid,
  p_new_stock numeric,
  p_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_unit text;
  v_old numeric;
begin
  if p_new_stock is null or p_new_stock < 0 then
    raise exception 'El stock no puede ser negativo';
  end if;

  select unit, stock into v_unit, v_old from ingredients where id = p_ingredient_id;
  if v_unit is null then
    raise exception 'Ingrediente no encontrado';
  end if;

  update ingredients set stock = p_new_stock, updated_at = now()
    where id = p_ingredient_id;

  insert into inventory_movements (ingredient_id, type, quantity, unit, description)
  values (p_ingredient_id, 'ajuste', p_new_stock - v_old, v_unit,
          coalesce(nullif(trim(p_note), ''), 'Conteo físico'));
end;
$$;

grant execute on function set_stock_count to anon, authenticated;
