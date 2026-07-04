# Tarea activa: T-003 — Deploy a Vercel

**Prioridad:** P1 · **Sprint:** 1 · **Inicio:** 2026-07-04 · Autorizado por el usuario.

## Pipeline
| Etapa | Veredicto | Notas |
|---|---|---|
| Orchestrator | ✅ asignada | Usuario autorizó permisos de Vercel. |
| Planner | ✅ | Plan: desplegar `nori-os/` vía MCP de Vercel; configurar NEXT_PUBLIC_SUPABASE_URL/ANON_KEY en el proyecto; verificar build remoto y rutas en producción (¡primer test end-to-end contra Supabase real con red abierta!). Riesgo: el deploy MCP empaqueta el directorio actual — cuidar que el root sea nori-os/. |
| Developer | 🟡 bloqueado | El sandbox no puede autenticar el CLI de Vercel (egress bloqueado) y el MCP no expone create_project/env vars. Se requiere importación única del repo por el usuario en vercel.com/new. Instrucciones enviadas. |
| Reviewer | ⏳ | |
| QA | ⏳ | |
| Nutrition | ⏳ | |
| Deployment | ⏳ | |
