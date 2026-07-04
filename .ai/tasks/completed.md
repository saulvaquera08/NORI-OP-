# Tareas completadas

## Pre-sistema de agentes (histórico, 2026-07-02 → 2026-07-04)
- Implementación inicial de NORI OS desde el handoff de Claude Design: 7 pantallas, shell, tokens, Supabase schema + clientes, RPC de producción. (commit `0428601`)
- Push inicial a GitHub `saulvaquera08/NORI-OP-`.
- Schema aplicado al proyecto Supabase "Nori" (11 tablas + RPC, sin datos demo).
- Recetario de marca NORI: migraciones `0002`/`0003`, 5 recetas + nutrición + sellos + reglas, aplicadas a Supabase. (commit `c8b512b`)

---
(Las tareas del pipeline de agentes se agregan aquí al cerrarse.)

## T-001 · Pantallas resilientes a base vacía + receta no hardcodeada — ✅ 2026-07-04

**Pipeline:** Orchestrator ✅ → Planner ✅ → Developer ✅ → Reviewer ✅ (1 nota no crítica: cast en join, consistente con patrón existente) → QA ✅ → Nutrition ✅ N/A (diff sin impacto en cálculos, verificado) → Deployment ✅ (build + lint limpios, sin deps ni env vars nuevas).

**Cambios:** `EmptyState` reutilizable; `getPrimaryFormuladorRecipe()` reemplaza a `getRecipeByName`/`getVigenteVersion` (eliminados); Formulador y Nutrimental ya no dependen de la receta hardcodeada "Chocolate Proteico"; Producción muestra estado vacío y oculta el form si no hay recetas con versiones.

**Evidencia QA:** las 7 rutas responden 200 contra una base vacía (mock exacto del protocolo PostgREST, incl. semántica PGRST116 de `maybeSingle`); estados vacíos renderizan su contenido; sin overflow horizontal a 375px (playwright, capturas en scratchpad).

**Hallazgos durante la tarea:**
- La auditoría inicial marcaba crash en Producción con 0 órdenes: FALSO — ya existía guard `selected ?`. Solo se mejoró el branch vacío a EmptyState.
- `recipe-calc.ts` ya estaba protegido contra división por cero (totalGrams=0).
- El sandbox bloquea egress a `*.supabase.co` desde procesos locales (el MCP sí funciona) → QA de estados vacíos se hace con mock PostgREST local.

## T-002 · Pantalla "Recetario" (recetas de marca NORI) — ✅ 2026-07-04

**Pipeline:** Orchestrator ✅ → Planner ✅ → Developer ✅ → Reviewer ✅ (1 crítica corregida: faltaba `order()` determinista en sellos) → QA ✅ → Nutrition ✅ → Deployment ✅ (build + lint limpios, sin deps nuevas).

**Cambios:** ruta `/recetario` + entrada en sidebar con icono propio; tipos de las 4 tablas del recetario en `types.ts`; `getBrandRecipeData()` (selects planos unidos en JS); ficha por receta: badges de máquina/versión/estacional, delta con link a la base, ingredientes con función, proceso numerado, nutrición declarada (nulls omitidos), 5 sellos NOM-051 con valor real y umbral, notas críticas, banner permanente de "valores estimados — pendiente bromatológico"; reglas de formulación al pie de la lista.

**Evidencia QA/Nutrition:** app corrida contra mock PostgREST con fixtures generados desde las MISMAS migraciones que producción; verificación numérica por receta contra `recipe_nutrition` (395/35.2/319/414 Creami · 373/16.1/64 Whynter · 428/38 Chocolate · 400/35 Cajeta · 448/36 Plátano) — todas coinciden; nulls omitidos (Chocolate solo muestra Energía y Proteína); Whynter sin glicerina; banner en las 5; 12 rutas probadas en 200; sin overflow a 375px.
