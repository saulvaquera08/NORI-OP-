# Tarea activa: T-004 — Catálogo real de ingredientes (+ T-005 en cola inmediata)

**Estado: implementadas y verificadas — PENDIENTE aplicar a producción** (conector MCP de Supabase caído; reintentar).

## Pipeline T-004 (catálogo + packaging)
| Etapa | Veredicto | Notas |
|---|---|---|
| Orchestrator | ✅ | |
| Planner | ✅ | |
| Developer | ✅ | Migración `0004_catalogo_ingredientes.sql` probada en Postgres local. |
| Reviewer | ✅ | Precios trazados 1:1 al costo unitario del fundador; macros marcados "tabla estándar, pendiente validación". |
| QA | ✅ | 8 rutas en 200 con fixtures del estado producción; Inventario muestra los 8 ingredientes sin NaN y sin falsos "Stock bajo"; Formulador sigue en estado vacío (esperado: aún no hay recetas de formulador). |
| Nutrition | ✅ | Recálculo independiente del costo/pinta: $55.61 (cantidades de receta) y $54.46 (cantidades de la tabla del fundador) — dentro del rango declarado $54-58. Alerta T-012 registrada (kcal de alulosa/glicerina). |
| Deployment | 🟡 | Build+lint limpios; **falta aplicar 0004 a producción** (MCP caído). |

## Pipeline T-005 (metas de venta)
Igual que T-004: todo ✅ excepto Deployment 🟡 (falta aplicar `0005_metas_de_venta.sql`).
QA: dashboard muestra "Meta mensual de ventas al 0%" contra la meta de $13,000.

## Discrepancias detectadas (para decisión del usuario — NO resueltas en silencio)
1. **Isopure:** la receta dice 28 g/pinta ("1 scoop"); la tabla de costos usa 25 g.
2. **Leche:** la receta dice 300 ml; la tabla de costos usa ~380 ml (los 17 g de azúcar de la nutrición cuadran mejor con ~380 ml).

## Pendiente del usuario (adicional a lo entregado)
- Validar macros por 100 g usados (tabla estándar) antes de confiar en la nutrición del formulador.
- Stocks y mínimos reales cuando existan.
