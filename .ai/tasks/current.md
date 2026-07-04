# Tarea activa: T-018 — Variaciones de recetas + tabla nutrimental automática

**Prioridad:** #1 del fundador ("lo más importante") · **Sprint:** 2 · **Estado:** plan listo, implementación por iniciar.

## Pipeline
| Etapa | Veredicto | Notas |
|---|---|---|
| Orchestrator | ✅ asignada | Encabeza el Sprint 2. Absorbe T-012 (prerequisito matemático). |
| Planner | ✅ plan listo | Verificado contra código: recipe-calc usa constante VASO_ML=240; el formulador edita la versión vigente EN SITIO (no hay "guardar como nueva versión"); recipe_versions está vacía en producción. |
| Developer | ⏳ | |
| Reviewer | ⏳ | |
| QA | ⏳ | |
| Nutrition | ⏳ | |
| Deployment | ⏳ | |

## Plan (Planner)

**Objetivo:** que Saúl pueda abrir la Base V6 en el Formulador, ajustar gramos, guardar el ajuste como **nueva versión inmutable** (V7, V8… — nunca se borra nada) y que la **Tabla Nutrimental se genere sola** para la versión vigente, con kcal correctas para alulosa.

### Pasos
1. **Migración 0007** (T-012): columna `ingredients.non_metabolizable_carbs_g_100g` (default 0); alulosa = 100. Ajustar `recipe-calc.ts`: kcal = proteína×4 + (carbos − no_metab)×4 + grasas×9 (glicerina se queda a 4 kcal/g: error ≤2 kcal por pinta, aceptado).
2. **Migración 0008:** sembrar la Base V6 Simple · Ninja Creami como versión de formulador: `recipe_versions` V6 `vigente` (recipe f0…01, sell_price $130 wholesale, serving_size_ml 475 = pinta) + sus 8 `recipe_version_ingredients` desde el catálogo real (leche 300 g≈300 ml y vainilla 10 g≈10 ml — aproximación densidad≈1, registrar en decisions).
3. **recipe-calc:** parametrizar tamaño de porción (usar `serving_size_ml` de la versión en lugar de la constante 240) — la etiqueta será "por pinta", consistente con el producto real.
4. **Acción "Guardar como nueva versión":** duplica las filas de la versión vigente → version_number+1 con los gramos actuales, nueva = `vigente`, anterior = `archivada`. Nunca borra versiones.
5. **Nutrimental:** ya se genera de la vigente — verificar números con porción de 475 ml y agregar el banner explícito "estimado — pendiente bromatológico".

### Criterios de aceptación
- A1: Formulador muestra Base V6 con los 8 ingredientes reales y costo/pinta ≈ $55.61 (verificación Nutrition previa).
- A2: kcal por pinta SIN contar alulosa ≈ valores declarados del recetario (~390-400 con 300 ml de leche) — no los ~570 que saldrían contando alulosa a 4 kcal/g.
- A3: "Guardar como nueva versión" crea V7 vigente, V6 pasa a archivada, ambas consultables; la nutrimental refleja V7.
- A4: Producción puede crear una orden contra la V6/V7 y descuenta inventario (cierra el ciclo: producir → receta usada → inventario).
- A5: Build/lint limpios; migraciones probadas local → producción.

### Fuera de alcance
Captura de inventario (T-015) y ventas (T-016) — siguientes del sprint; export PNG/PDF (T-007).

## Pendiente de infraestructura
- Aplicar `0006_drop_ai_chat.sql` a producción cuando regrese el conector de Supabase (tablas vacías, sin urgencia).
