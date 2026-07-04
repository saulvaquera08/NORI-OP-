# Arquitectura — NORI OS

## Stack
- **Next.js 16 (App Router)** + TypeScript estricto + Tailwind CSS v4 — app en `nori-os/`.
- **Supabase** (Postgres + PostgREST) como única fuente de datos. Proyecto: `ncekuagdxcngefoafzro` ("Nori", us-west-2).
- `@supabase/ssr` para clientes server/browser. Sin ORM: queries directas con el cliente tipado.
- Fuentes: Instrument Sans (UI) + JetBrains Mono (números) vía `next/font`.
- Sin shadcn CLI (registry bloqueado en el sandbox): primitivas UI hechas a mano en `src/components/ui/` con Radix + CVA.

## Estructura
```
nori-os/
  src/app/(app)/          ← 7 pantallas (dashboard, formulador, nutrimental,
                            inventario, produccion, ventas, nori-ai)
  src/app/(app)/layout.tsx← shell: sidebar + topbar
  src/components/nori/    ← sidebar, topbar, nav-icon, setup-required
  src/components/ui/      ← button, input, badge, card
  src/lib/supabase/       ← client.ts, server.ts, env.ts, types.ts (tipos DB a mano)
  src/lib/nori/
    data.ts               ← todas las lecturas a Supabase
    actions.ts            ← todas las Server Actions (mutaciones)
    recipe-calc.ts        ← cálculo puro de nutrición/costos/sellos (sin IO)
    format.ts             ← formato de dinero/fechas
  supabase/migrations/    ← fuente de verdad del schema (numeradas)
  supabase/demo-seed.sql  ← datos demo del prototipo (NUNCA en producción)
```

## Patrones obligatorios
1. **Lecturas** en Server Components async, vía helpers de `lib/nori/data.ts`.
2. **Mutaciones** solo vía Server Actions en `lib/nori/actions.ts` + `revalidatePath`.
3. **Cálculos** nutricionales/costos solo en `recipe-calc.ts` (puro, testeable).
4. **Estilo**: tokens `--nori-*` de `globals.css` (clases `bg-nori-card`, `text-nori-terracota`, etc.). No inventar colores.
5. Toda pantalla verifica `isSupabaseConfigured()` y muestra `<SetupRequired/>` si faltan env vars.
6. Migraciones: probar en Postgres local antes de aplicar al proyecto real; aplicar vía MCP `apply_migration`; repo y DB siempre sincronizados.
7. Lógica de negocio en DB solo cuando debe ser atómica (ej. RPC `create_production_order` que descuenta inventario).

## Cadena de datos conectados (spec del producto)
Fabricar lote → descuenta inventario → calcula costo → actualiza producción → costo promedio → habilita venta → utilidad → dashboard. La RPC `create_production_order` implementa los primeros pasos.

## Entorno
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local` (documentadas en `.env.local.example`).
- Deploy objetivo: **Vercel** (pendiente de configurar).
- Nota Next 16: leer `node_modules/next/dist/docs/` ante dudas de API — hay breaking changes vs. conocimiento previo.
