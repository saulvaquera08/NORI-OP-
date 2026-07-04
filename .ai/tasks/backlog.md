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

### T-004 · Captura del catálogo real de ingredientes 🟡 EN CIERRE (migración lista y probada; falta aplicar a producción)
**Evidencia:** `ingredients` tiene 0 filas; sin catálogo el Formulador no puede operar (y `create_production_order` no tiene qué descontar).
**Alcance:** insertar los ingredientes reales de NORI (leche descremada LALA, Isopure WPI, alulosa, aceite alto oleico, lecitina, xantana, vainilla Molina, glicerina, cacao natural, plátano…) con precio/kg, macros por 100 g, stock y mínimos reales.
**Estado:** **BLOQUEADA — requiere datos del usuario** (precios reales, stocks, proveedores). No inventar valores.

### T-005 · Metas de venta 🟡 EN CIERRE (migración lista: 3 fases + meta vigente $13,000; falta aplicar a producción)
**Evidencia:** tabla vacía; el Dashboard oculta la alerta de meta (guard en `dashboard/page.tsx:116`).
**Estado:** **BLOQUEADA — requiere dato del usuario** (meta real).

## P2 — Deuda y features del spec

### T-006 · NORI AI real ❌ CANCELADA (decisión firme del usuario: la app es control operativo, sin IA; módulo eliminado en T-014)
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

### T-012 · recipe-calc: carbohidratos no metabolizables (NUEVA, detectada en T-004)
**Evidencia:** `recipe-calc.ts` calcula kcal = proteína×4 + carbos×4 + grasas×9 sobre TODOS los carbohidratos. La alulosa (45 g/pinta, no metabolizable, ~0.2-0.4 kcal/g) inflaría las kcal del formulador en ~+170; la glicerina aporta ~4.3 kcal/g. El recetario de marca ya trata la alulosa como no metabolizable (Whynter: 373 kcal con 64 g de carbos).
**Alcance:** campo `non_metabolizable_carbs_g_100g` (o factor kcal por ingrediente) en `ingredients` + ajuste del cálculo + validación del agente Nutrition.
**Prioridad:** debe resolverse ANTES de usar el formulador para nutrición con alulosa/glicerina (bloquea T-009).

---
## Auditoría de mejoras 2026-07-04 (post-Sprint 2, con capturas en scratchpad)

### T-020 · Responsive móvil real — PRIORIDAD ALTA (diseño)
**Evidencia:** captura a 375px: la sidebar fija de 236px consume el 63% de la pantalla; las tarjetas KPI del dashboard quedan ilegibles (texto encimado en ~35px de ancho cada una). La captura de inventario/ventas ocurrirá desde el celular (cocina/gym).
**Alcance:** sidebar colapsable (hamburguesa o barra inferior) bajo 768px; grids 4→2→1 columnas; formularios apilados; probar las 7 pantallas a 375px.

### T-021 · Costo y margen REALES con empaque — PRIORIDAD ALTA (funcional)
**Evidencia:** el panel "En vivo" muestra margen 57.2% usando solo ingredientes ($55.60); el COGS real del fundador incluye pinta+tapa y etiqueta ($15-22 bajo volumen) → margen wholesale real ~43%. La tabla `packaging_items` ya existe en la base y NO se usa en ningún cálculo.
**Alcance:** sumar empaque (rango bajo volumen) al costo por pinta en Formulador; mostrar "costo con empaque" y "margen real"; misma cifra en Producción (snapshot).

### T-022 · Editar ingrediente (precio/macros/proveedor) — PRIORIDAD ALTA (funcional)
**Evidencia:** solo hay alta (T-019); los precios cambian (la palanca #1 del negocio es renegociar Isopure/alulosa) y hoy actualizar un precio requiere SQL.
**Alcance:** editar desde la tarjeta de Inventario; al cambiar precio se recalculan costos en vivo (las órdenes pasadas conservan su snapshot — correcto).

### T-023 · Completar/cancelar orden de producción — PRIORIDAD ALTA (funcional)
**Evidencia:** las órdenes nacen "en_proceso" y no hay acción para marcarlas completadas; los KPIs del dashboard (producción del mes, costo) SOLO cuentan `completada` → hoy nunca se llenarían.
**Alcance:** botones "Completar" / "Cancelar" en el detalle de la orden (con rendimiento/merma finales editables al completar).

### T-024 · Correcciones de captura en Ventas — media
**Evidencia:** no hay forma de corregir una venta mal capturada (borrar/editar). En inventario los errores se corrigen con conteo físico (ya posible).
**Alcance:** eliminar venta desde "Pedidos recientes" + marcar pagado/pendiente.

### T-025 · Pulido visual menor — media
- Dashboard: ocultar "↑ 0.0% vs mes anterior" cuando no hay mes previo.
- Inventario: tarjetas muestran "· lote" colgado cuando lot_code es null (captura); ocultarlo. Badge OK se encima con nombres largos.
- Ventas: "Pedidos recientes" vacío sin mensaje (dashboard sí lo tiene).
- Formulador: nombres truncados del catálogo sin tooltip (`title`).
- Nutrimental: indicar "de los cuales no metabolizables: X g" bajo carbohidratos; comparador de versiones podría mostrar también kcal y costo.

### T-026 · Acciones rápidas en Dashboard — media
**Evidencia:** el spec original pedía "acciones rápidas"; hoy capturar requiere navegar a cada módulo.
**Alcance:** 3 botones en el dashboard: Registrar venta · Movimiento de inventario · Nueva orden.

### (Recordatorios ya en backlog, suben de urgencia)
- **T-008 Auth**: la URL es pública y CUALQUIERA puede editar recetas/costos. Crítico antes de compartir el link al socio o a gyms.
- **T-007 Export PNG/PDF** de la etiqueta nutrimental (botones "Próximamente").
- **T-010** queda absorbida por T-020.
