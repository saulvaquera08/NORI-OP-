# Changelog

## 2026-07-04
- Sistema de agentes `.ai/` creado (7 agentes, contexto, backlog auditado, memoria).
- Auditoría inicial: build/lint OK; 3 crashes detectados contra DB vacía (formulador, nutrimental, producción); recetario de marca sin UI.
- Recetario de marca NORI aplicado a Supabase (5 recetas, 24 ingredientes, 5 nutriciones, 25 sellos, 6 reglas). Commit `c8b512b`.

## 2026-07-02/03
- App NORI OS implementada desde el handoff de Claude Design (7 pantallas). Commit `0428601`.
- Schema inicial aplicado al proyecto Supabase "Nori" (11 tablas, RPC, RLS permisivo).
- Repo publicado en GitHub `saulvaquera08/NORI-OP-`.

## 2026-07-04 (pipeline de agentes)
- T-001 cerrada: pantallas resilientes a base vacía, receta hardcodeada eliminada, EmptyState reutilizable. Las 7 rutas responden 200 contra DB sin datos operativos.
- T-002 cerrada: pantalla /recetario con las 5 recetas de marca, sellos NOM-051, reglas de formulación y banner de estimados.
- T-003 cerrada: NORI OS EN PRODUCCIÓN en https://nori-op.vercel.app.
- T-004/T-005 cerradas: catálogo real y metas aplicados a Supabase producción.
- T-013 cerrada: eliminado el usuario placeholder del prototipo; footer "Uso interno · NORI". SPRINT 1 CERRADO.

## Sprint 2 (2026-07-04)
- Dirección del fundador registrada: control operativo, cero IA. Backlog reordenado.
- T-014: módulo NORI AI eliminado (ruta, sidebar, topbar ⌘K, caja "sugiere" del formulador, actions, tipos, token CSS, migración 0006 drop de tablas de chat). Bonus: título "Recetario" faltante en topbar corregido.
- T-019: alta de ingredientes desde la UI (Inventario → "+ Agregar ingrediente": precio, proveedor, macros por 100 g incl. no metabolizables, stock y mínimo). Se refleja automáticamente en Formulador.
