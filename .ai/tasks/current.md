# Sprint 3 — Login + iPhone-first + arreglos de auditoría (T-008, T-020, T-021, T-022 parcial, T-023, T-024, T-025)

**Estado: código completo y verificado E2E — en `main` (auto-deploy). PENDIENTE: (1) crear los 2 usuarios en Supabase Auth (acción del usuario), (2) aplicar migración 0010 (RLS solo authenticated) a producción.**

## Pipeline
| Etapa | Veredicto | Notas |
|---|---|---|
| Orchestrator/Planner | ✅ | Paquete autorizado por el fundador: "arregla todo lo necesario + login simple + fácil en iPhone". |
| Developer | ✅ | proxy.ts (Next 16 renombró middleware→proxy, detectado vía docs del paquete); /login; guard en layout + correo y "Salir" en sidebar; MobileNav inferior estilo iOS con safe-area; grids responsivas en 7 pantallas; paneles del formulador apilados en móvil; migración 0010 RLS authenticated-only + revoke de RPCs a anon; completar/cancelar orden; precio editable de ingrediente; corregir/eliminar venta; costo+empaque y margen real; pulido (growth sin mes previo, lote null, mensajes vacíos, tooltips, fila no-metabolizables). |
| Reviewer | ✅ | Diff completo revisado durante construcción; mock extendido con GoTrue+CORS solo en scratchpad (no toca el repo). |
| QA | ✅ E2E | Playwright viewport iPhone (393px): sin sesión → redirige a /login; login → dashboard; 7 pantallas sin overflow horizontal y con bottom nav; /login con sesión → dashboard. Capturas s3_*.png. |
| Nutrition | ✅ | Costo+empaque $70.60–77.60 y margen real 40.3–45.7% — coinciden con el COGS ($70-78) y margen (~43%) declarados por el fundador. |
| Deployment | 🟡 | Build+lint limpios (salida completa revisada); push a main. Falta 0010 en producción + alta de usuarios. |

## Para activar el login (acción del usuario, 2 min)
1. Supabase → Authentication → Users → **Add user** → correo y contraseña tuyos y de tu socio (marca "Auto Confirm").
2. Aplicar `0010_auth_rls.sql` (yo vía MCP cuando regrese, o pegar en SQL Editor).
3. La app pedirá login; sin sesión nadie puede leer/escribir nada (ni por API).
