# Base de datos — Supabase `ncekuagdxcngefoafzro`

## Dos dominios de recetas (¡no confundir!)
1. **Formulador** (`recipe_versions` + `recipe_version_ingredients` + catálogo `ingredients`): recetas editables gramo a gramo, con costos/macros CALCULADOS desde el catálogo. Diseñado para el flujo del prototipo.
2. **Recetario de marca** (`recipe_ingredients` + `recipe_nutrition` + `recipe_nom051_seals`): las recetas oficiales NORI con valores DECLARADOS (estimados, `is_lab_verified=false`). Las variantes guardan solo deltas vía `recipes.base_recipe_id`.

Ambos dominios cuelgan de la misma tabla `recipes`.

## Tablas (schema `public`)
| Tabla | Propósito | Estado datos (2026-07-04) |
|---|---|---|
| `recipes` | Receta (nombre, slug, machine, base_recipe_id, process_steps, is_lab_verified, seasonal, notes) | **5 recetas de marca** |
| `recipe_ingredients` | Líneas declaradas del recetario (texto libre, cantidades nullable) | 24 |
| `recipe_nutrition` | Nutrición declarada por envase (nulls = no declarado) | 5 |
| `recipe_nom051_seals` | Evaluación de sellos por receta (threshold/actual como texto) | 25 |
| `formulation_rules` | Reglas globales de formulación | 6 |
| `recipe_versions` | Versiones del formulador (V1..Vn, `vigente` único parcial) | 0 |
| `recipe_version_ingredients` | Gramos por ingrediente del catálogo | 0 |
| `ingredients` | Catálogo maestro (precio/kg, macros por 100 g, stock, lote) | 0 — **falta captura real** |
| `inventory_movements` | Ledger append-only (entrada/salida/ajuste) | 0 |
| `production_orders` | Órdenes de producción (código OP-####, snapshot de costo) | 0 |
| `sales_channels` / `sales_orders` | Canales y ventas (`amount` columna generada) | 0 |
| `chat_conversations` / `chat_messages` | Chat NORI AI | 0 |
| `company_settings` | Fila única (meta mensual de ventas) | 0 |

## RPC
- `create_production_order(...)`: genera código OP-####, snapshotea costo por unidad desde el catálogo, descuenta stock y escribe movimientos de inventario. `SECURITY DEFINER`, ejecutable por `anon` (aceptado mientras no haya auth; ver advisors).

## Seguridad (estado aceptado temporalmente)
- RLS habilitado en TODAS las tablas con políticas permisivas `using(true)` — los advisors de Supabase lo marcan (WARN). Es deliberado hasta que exista auth/roles. Tarea de hardening en el backlog.

## Reglas operativas
- Cambios de schema SIEMPRE como migración en `nori-os/supabase/migrations/`, probada en Postgres local, luego aplicada vía MCP. Nunca editar schema a mano en el dashboard.
- Los IDs sembrados usan UUIDs fijos (`a…` ingredientes demo, `f…` recetas de marca) para idempotencia.
- `supabase/demo-seed.sql` es SOLO para demos/desarrollo local. Prohibido aplicarlo al proyecto real.
- Migraciones aplicadas al proyecto real hasta hoy: `nori_os_init`, `nori_brand_recipes`, `nori_brand_recipes_seed`.
