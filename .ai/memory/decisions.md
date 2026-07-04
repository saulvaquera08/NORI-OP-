# Decisiones de arquitectura y producto

## 2026-07-02 — Stack
- **Next.js + TypeScript + Tailwind + Supabase + primitivas estilo shadcn** (elegido por el usuario). El registry de shadcn está bloqueado en el sandbox → componentes UI hechos a mano con Radix.

## 2026-07-04 — Datos
- **D-001:** El proyecto Supabase real (`ncekuagdxcngefoafzro`) arrancó SOLO con schema; los datos demo del prototipo viven en `supabase/demo-seed.sql` y está prohibido aplicarlos a producción. Razón: el usuario capturará datos reales.
- **D-002:** Recetario de marca modelado como dominio separado del formulador, compartiendo la tabla `recipes`: valores DECLARADOS (estimados) en `recipe_nutrition`/`recipe_nom051_seals` vs. valores CALCULADOS del catálogo en el formulador. Razón: los datos de marca traen totales pre-calculados y líneas sin precio/macros; mezclarlos con el catálogo obligaría a inventar valores (prohibido).
- **D-003:** Variantes de sabor guardan SOLO deltas (`base_recipe_id`), igual que la fuente del fundador. Reconstruir la receta completa es responsabilidad de la capa de presentación.
- **D-004:** Umbrales NOM-051 guardados como texto (`'275 kcal/100 g'`, `'1.0 mg/kcal'`) porque las unidades difieren por sello.
- **D-005:** RLS permisivo (`using(true)`) aceptado temporalmente al no existir auth; los 15 WARN de advisors son conocidos. Hardening = T-008.

## 2026-07-04 — Proceso
- **D-006:** Todo desarrollo pasa por el pipeline de agentes de `.ai/agents/` (Orchestrator → Planner → Developer → Reviewer → QA → Nutrition → Deployment). Una tarea a la vez; ninguna se cierra sin la aprobación de todos.
- **D-007:** Toda migración se prueba primero en Postgres 16 local y después se aplica vía MCP al proyecto real; repo y DB siempre sincronizados.
- **D-008 (T-002):** `getBrandRecipeData` usa selects planos por tabla unidos en JS en vez de embedded joins de PostgREST. Razón: tablas diminutas (≤25 filas) y permite QA con fixtures que replican producción sin simular la sintaxis de joins.
- **D-009 (T-004):** Macros por 100 g del catálogo tomados de tablas estándar (el usuario solo dio precios). Marcados "pendiente validación" en la migración; el formulador no debe usarse para etiquetado hasta validarlos. Stock/mínimos en 0 hasta captura real.
- **D-010 (T-004):** Los precios usan el costo unitario puntual del fundador (no los rangos de presentación): $1,130/kg Isopure, $28/L leche, $250/kg alulosa, $80/kg aceite, $400/kg lecitina, $350/kg xantana, $130/L vainilla, $130/kg glicerina.
- **D-011 (T-005):** `company_settings.monthly_sales_goal = $13,000` = techo de la fase actual (100 pintas × $130 wholesale, límite de capacidad de la Creami). Las 3 fases completas viven en `sales_goal_phases`.
