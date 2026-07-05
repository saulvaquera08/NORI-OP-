# Sprint 5 — Rediseño Formulador + Recetario, unidades ml/g, alta de recetas de marca — ✅ CERRADO 2026-07-05

## Pipeline
| Etapa | Veredicto | Notas |
|---|---|---|
| Orchestrator/Planner | ✅ | Pedido del fundador: "No me gusta el formulador ni el recetario, no deja agregar recetas en recetario, y el formulador solo pone gramos — necesito ml también". 4 tareas: rediseñar formulador, rediseñar recetario, alta de recetas de marca, unidades ml/g. |
| Developer | ✅ | (1) `IngredientNutrition.unit` propagado desde catálogo; el formulador muestra "ml" para líquidos (unit 'L') y "g" para sólidos por ingrediente (D-013). (2) Formulador rediseñado: barra de recetas en chips, tarjetas de ingrediente con steppers −/+, input con sufijo de unidad, picker móvil, panel "en vivo" con costo/nutrición/empaque/margen. (3) Recetario rediseñado a barra de chips + tarjetas (coherente con formulador). (4) Nueva acción `createBrandRecipe` (slug único, ingredientes, nutrición declarada estimada, is_lab_verified=false) + modal `NuevaBrandRecetaForm` con filas dinámicas de ingrediente y nutrición opcional. |
| Reviewer | ✅ | Bug REAL cazado en QA visual: en móvil el editor del formulador quedaba atrapado en un scroll interno anidado (patrón h-full + flex-1 overflow-y-auto) → las filas de ingredientes casi no se veían bajo el panel "en vivo". Corregido: en móvil la columna scrollea como una sola; los scrolls independientes por columna solo aplican en md+. |
| QA | ✅ E2E | Playwright iPhone (393×852) contra mock PostgREST+GoTrue: formulador sin overflow con unidades ml+g visibles por ingrediente (leche 300 ml, aceite 13 ml, polvos en g); recetario con 5 chips + botón "Nueva receta"; modal abre con campo nombre y filas de ingrediente dinámicas; desktop OK. Capturas visuales aprobadas. |
| Nutrition | ✅ N/A | Motor de cálculo sin cambios; solo se añadió el campo `unit` para presentación. kcal siguen excluyendo carbohidratos no metabolizables. |
| Deployment | ✅ | Build + lint limpios (salida completa). Push a main → auto-deploy. |

## Nota de datos
`createBrandRecipe` guarda la nutrición como **estimada** del fundador (is_lab_verified=false, banner "pendiente bromatológico"). No inventa valores: los campos nutricionales son opcionales y quedan nulos si no se capturan.
