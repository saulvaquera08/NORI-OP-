# PROJECT STATUS — NORI OS

_Actualizado: 2026-07-04 · por: Orchestrator_

## Estado general
🟡 **Funcional en desarrollo, no desplegado.** Build, lint y TypeScript pasan. Las 7 pantallas del prototipo funcionan contra la base real (incluyendo estados vacíos diseñados — T-001 cerrada). El recetario de marca NORI ya es visible en la app (/recetario, T-002 cerrada). Sin deploy en Vercel todavía.

## Infraestructura
| Pieza | Estado |
|---|---|
| Repo GitHub `saulvaquera08/NORI-OP-` | ✅ sincronizado (`main`) |
| Supabase "Nori" `ncekuagdxcngefoafzro` | ✅ schema completo (16 tablas + RPC), migraciones versionadas |
| Datos reales en Supabase | ✅ recetario (5 recetas) + catálogo real (8 ingredientes, precios del fundador) + packaging + metas por fase |
| Vercel | 🟡 proyecto `nori-op` creado y build OK; falta desactivar Deployment Protection y verificar dominio (T-003) |
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
1. **T-003** — deploy a Vercel (esperando confirmación de cuenta).

## Bloqueadores
- **T-004** catálogo de ingredientes: esperando precios/stocks/macros reales del usuario.
- **T-005** meta mensual de ventas: esperando cifra del usuario.
- **T-003** Vercel: esperando confirmación de cuenta del usuario.
- **T-006** NORI AI real: esperando decisión de proveedor LLM y API key.

## Próximo sprint (propuesta)
Sprint 2 — "Datos reales y primer deploy": T-004 + T-005 (al llegar los datos), T-007 export PNG/PDF, auditoría responsive (T-010). Al final: primera versión productiva para uso interno en NORI.
