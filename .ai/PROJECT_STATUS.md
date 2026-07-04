# PROJECT STATUS — NORI OS

_Actualizado: 2026-07-04 · por: Orchestrator_

## Estado general
🟢 **EN PRODUCCIÓN: https://nori-op.vercel.app** — Sprint 1 completado (T-001…T-005, T-013). Las 8 pantallas viven contra el Supabase real con recetario de marca, catálogo con precios reales y metas por fase. Confirmado por el usuario en producción.

## Infraestructura
| Pieza | Estado |
|---|---|
| Repo GitHub `saulvaquera08/NORI-OP-` | ✅ sincronizado (`main`) |
| Supabase "Nori" `ncekuagdxcngefoafzro` | ✅ schema completo (16 tablas + RPC), migraciones versionadas |
| Datos reales en Supabase | ✅ recetario (5 recetas) + catálogo real (8 ingredientes, precios del fundador) + packaging + metas por fase |
| Vercel | ✅ https://nori-op.vercel.app (deploy automático desde `main`) |
| Auth / roles | ❌ no existe; RLS permisivo deliberado (T-008) |

## Módulos
| Módulo | Implementado | Funciona con DB real |
|---|---|---|
| Dashboard | ✅ | ✅ (agregados en cero) |
| Formulador | ✅ | ✅ estado vacío diseñado (espera catálogo T-004) |
| Nutrimental | ✅ | ✅ estado vacío diseñado (espera catálogo T-004) |
| Inventario | ✅ | ✅ (vacío) |
| Producción | ✅ | ✅ estado vacío diseñado |
| Ventas | ✅ | ✅ (vacío) |
| NORI AI | ✅ UI/persistencia | 🟡 respuestas placeholder, sin LLM (T-006) |
| Recetario de marca | ✅ /recetario | ✅ (5 recetas, sellos, reglas) |
| Compras / Finanzas / CRM / Documentos / Configuración | ❌ no iniciados (T-011) | — |

## Pendientes inmediatos
1. Decidir próximo sprint (candidatas: T-008 auth —2 usuarios reales—, T-007 export, T-010 responsive, T-012 carbos no metabolizables).

## Bloqueadores
- Validación del usuario: macros por 100 g (tabla estándar) y discrepancias receta vs. costos (Isopure 28 vs 25 g; leche 300 vs 380 ml).
- Stocks/mínimos reales de inventario pendientes de captura.
- QA HTTP directo a producción desde el sandbox: requiere hosts en el network allowlist del entorno (opcional).
- **T-006** NORI AI: EN PAUSA por decisión del usuario.

## Próximo sprint (propuesta)
Sprint 2 — "Datos reales y primer deploy": T-004 + T-005 (al llegar los datos), T-007 export PNG/PDF, auditoría responsive (T-010). Al final: primera versión productiva para uso interno en NORI.
