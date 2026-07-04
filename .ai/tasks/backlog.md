# Backlog — NORI OS

Ordenado por prioridad. Cada tarea nace de la auditoría del 2026-07-04 (código + Supabase real + diseño importado). No hay tareas inventadas.

## P0 — Bugs que rompen la app con la base real

### T-001 · Pantallas resilientes a base vacía + receta no hardcodeada
**Evidencia:** `formulador/page.tsx:14` y `nutrimental/page.tsx:11` hacen `getRecipeByName(supabase, "Chocolate Proteico")` con `.single()` — esa receta no existe en la DB real → **crash 500**. `produccion/page.tsx:115-164` usa `selected.status` sin guard cuando hay 0 órdenes → **TypeError**. La DB real hoy tiene 0 filas en `ingredients`, `recipe_versions`, `production_orders`, `sales_orders`.
**Alcance:** Formulador y Nutrimental seleccionan dinámicamente la primera receta con versiones (o muestran estado vacío diseñado); Producción muestra estado vacío sin orden seleccionada; componente `EmptyState` reutilizable.
**Estado:** lista para trabajar.

## P1 — Para que NORI OS sea usable internamente

### T-002 · Pantalla "Recetario" — mostrar las recetas de marca NORI
**Evidencia:** las 5 recetas (Base V6 Creami/Whynter, Chocolate, Cajeta, Plátano) están en Supabase (`recipes` + `recipe_ingredients` + `recipe_nutrition` + `recipe_nom051_seals` + `formulation_rules`) y **ninguna pantalla las muestra**.
**Alcance:** nueva ruta `/recetario` en el sidebar: lista de recetas (badge de máquina, seasonal, "estimado — pendiente bromatológico"), detalle con ingredientes (deltas indicando su base), proceso, nutrición declarada, sellos y reglas de formulación.
**Estado:** lista para trabajar.

### T-003 · Deploy a Vercel
**Evidencia:** no existe proyecto Vercel; objetivo declarado del usuario.
**Alcance:** conectar repo, configurar `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`, verificar build en Vercel, documentar URL.
**Estado:** requiere confirmación del usuario para crear el proyecto en su cuenta Vercel.

### T-004 · Captura del catálogo real de ingredientes
**Evidencia:** `ingredients` tiene 0 filas; sin catálogo el Formulador no puede operar (y `create_production_order` no tiene qué descontar).
**Alcance:** insertar los ingredientes reales de NORI (leche descremada LALA, Isopure WPI, alulosa, aceite alto oleico, lecitina, xantana, vainilla Molina, glicerina, cacao natural, plátano…) con precio/kg, macros por 100 g, stock y mínimos reales.
**Estado:** **BLOQUEADA — requiere datos del usuario** (precios reales, stocks, proveedores). No inventar valores.

### T-005 · Sembrar `company_settings` (meta mensual de ventas)
**Evidencia:** tabla vacía; el Dashboard oculta la alerta de meta (guard en `dashboard/page.tsx:116`).
**Estado:** **BLOQUEADA — requiere dato del usuario** (meta real).

## P2 — Deuda y features del spec

### T-006 · NORI AI real ⏸ EN PAUSA (decisión del usuario 2026-07-04: sin IA en la app por ahora)
**Evidencia:** `actions.ts:77-82` responde con 4 frases aleatorias hardcodeadas.
**Alcance:** conectar un LLM con contexto del negocio (recetas, inventario, ventas desde Supabase). Requiere decidir proveedor y API key.
**Estado:** requiere decisión del usuario (proveedor/costo).

### T-007 · Export PNG/PDF de la tabla nutrimental
**Evidencia:** botones deshabilitados con "Próximamente" (`nutrimental/page.tsx:108-121`); el spec del diseño pide PNG/PDF/SVG.
**Estado:** lista para trabajar (después de P1).

### T-008 · Auth + endurecer RLS y RPC
**Evidencia:** 15 advisors WARN de Supabase (políticas `using(true)` en todas las tablas; `create_production_order` SECURITY DEFINER ejecutable por `anon`).
**Alcance:** Supabase Auth, políticas por rol, revocar EXECUTE a anon.
**Estado:** lista para trabajar; deliberadamente pospuesta hasta que el uso interno lo exija (hoy solo el fundador usa la app).

### T-009 · Formulador ↔ Recetario de marca
**Evidencia:** los dos dominios de recetas no se comunican: el formulador no puede abrir una receta de marca para iterarla con costos del catálogo.
**Alcance:** por definir con el usuario (¿importar receta de marca como versión de formulador?). Depende de T-004.
**Estado:** bloqueada por T-004 y definición de producto.

## P3 — Más adelante

### T-010 · Responsive / mobile
**Evidencia:** layout con sidebar fija de 236px y grids de 4 columnas; sin breakpoints definidos. No auditado en móvil.
**Estado:** lista para auditar después de P1.

### T-011 · Módulos faltantes del spec original
**Evidencia:** el spec pide Ingredientes (CRUD), Compras, Finanzas, CRM, Documentos, Configuración; el prototipo aprobado solo cubrió 7 pantallas.
**Estado:** requiere priorización del usuario, módulo por módulo.
