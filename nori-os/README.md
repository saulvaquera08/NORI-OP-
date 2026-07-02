# NORI OS

Operating system for a high-protein ice cream company — Dashboard, Formulador
(recipe/costing engine), Nutrimental (NOM-051 label), Inventario, Producción,
Ventas, and NORI AI chat. Built with Next.js (App Router), TypeScript,
Tailwind CSS, shadcn-style components, and Supabase (Postgres + PostgREST) for
persistence.

This app implements the design in the Claude Design handoff bundle
(`../project/NORI OS - Producto.dc.html`), rebuilt against a real database
instead of the prototype's hardcoded mock data.

## 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com) (the free tier is
enough).

## 2. Run the migrations

In the Supabase dashboard, open **SQL Editor** and run, in order:

1. `supabase/migrations/0001_init.sql` — schema, RLS policies, and the
   `create_production_order` RPC (auto-decrements inventory when a batch is
   logged).
2. `supabase/migrations/0002_seed.sql` — seed data matching the prototype
   (ingredients, the Chocolate Proteico V1–V5 recipe history, inventory,
   production orders, ~30 days of sales history for the dashboard charts,
   and NORI AI chat history).

Or, with the [Supabase CLI](https://supabase.com/docs/guides/cli) linked to
your project: `supabase db push`.

## 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
your project's Settings → API page.

## 4. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Until Supabase is
configured, every route shows a "Falta conectar Supabase" setup screen
instead of throwing — this is expected and self-explanatory.

## Notes on scope

- **No auth/roles yet.** The product spec explicitly defers per-user
  permissions ("Más adelante existirán permisos por usuario"), so RLS
  policies currently allow all reads/writes with the anon key. Add
  Supabase Auth and scope the policies to `auth.uid()` before giving this
  to real users.
- **NORI AI replies are canned/randomized**, matching the prototype's
  behavior — there's no LLM wired up. Messages persist for real
  (`chat_conversations` / `chat_messages`), so swapping in a real model call
  inside `sendChatMessage` (`src/lib/nori/actions.ts`) is the natural next
  step.
- **NOM-051 seals** are a simplified heuristic (`src/lib/nori/recipe-calc.ts`)
  over solid-food thresholds — the UI already carries the same disclaimer the
  prototype specified ("validar antes de imprimir en empaque").
- **Photo upload** for production batches isn't wired to Supabase Storage —
  the `photos` column exists on `production_orders` for when that's needed.
