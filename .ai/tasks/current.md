# Tarea activa: Sprint 2 en cierre — T-018 + T-015 + T-016 implementadas

**Estado: código completo, verificado y en `main` (auto-deploy Vercel). PENDIENTE: aplicar migraciones 0006-0009 a Supabase producción (conector MCP caído — sin ellas las pantallas nuevas mostrarán estados vacíos/errores de columna).**

## Pipeline conjunto (T-018 variaciones+nutrimental · T-015 inventario · T-016 ventas · T-017 desbloqueada)
| Etapa | Veredicto | Notas |
|---|---|---|
| Orchestrator | ✅ | Las 3 tareas de captura se implementaron juntas por el reporte de fallas del fundador (todas eran "falta el formulario"). |
| Planner | ✅ | Plan T-018 + extensión de captura. |
| Developer | ✅ | Migraciones 0007 (carbos no metabolizables), 0008 (Base V6 al formulador), 0009 (canales + RPCs inventario); recipe-calc porción parametrizada; guardar-como-nueva-versión; nueva receta; forms inventario (conteo/entrada/salida/mínimo) y ventas. |
| Reviewer | ✅ | 1 crítica corregida en el camino: conflicto de unique(name) en canales → `on conflict (name)`. saveAsNewVersion sin transacción DB (secuencial con rollback manual del estado vigente) — aceptado para uso interno, anotado. |
| QA | ✅ | 7 rutas en 200 con fixtures con joins embebidos; formulador muestra Base V6 con botón "Guardar como V7"; forms presentes; producción ya ofrece la receta. Mutaciones de RPC probadas en Postgres local (entrada +3, conteo=40, salida −1 ✅). Límite: guardado de versión/ventas solo verificable en producción (mock read-only) — verificar con el usuario tras el deploy. |
| Nutrition | ✅ | **kcal 361/pinta y 89 kcal/100 g SIN contar alulosa** (contándola: ~541 — el bug T-012 queda resuelto). Proteína 34.2 g y costo $55.60 vs declarados 35.2 g/$54-58: deltas explicados por la discrepancia leche 300 vs 380 ml YA reportada al fundador. Sello de grasas relabeled "conservador" (el catálogo no distingue saturadas — honesto). |
| Deployment | 🟡 | Build+lint limpios; push a main hecho. **Falta aplicar 0006/0007/0008/0009 a producción.** |

## Al aplicar las migraciones, verificar en producción con el usuario:
1. Formulador: Base V6 visible, editar gramos, "Guardar como V7".
2. Nutrimental: etiqueta por pinta 475 ml.
3. Inventario: conteo físico de un ingrediente real.
4. Ventas: registrar una venta de prueba.
5. Producción: crear una orden (descuenta inventario).
