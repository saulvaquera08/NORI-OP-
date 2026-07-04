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
