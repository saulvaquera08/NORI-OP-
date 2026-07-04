-- NORI OS — brand recipes (recetario NORI)
-- Extends the formulador schema with the fields needed to store the official
-- NORI brand recipes: machine variants (Ninja Creami / Whynter), flavor deltas
-- over a shared base, declared (estimated) nutrition, NOM-051 seal evaluation,
-- and global formulation rules.
--
-- All macros are estimates from standard ingredient tables, NOT lab analyses —
-- is_lab_verified stays false until a bromatológico exists (mandatory before
-- commercial packaging).

-- ----------------------------------------------------------------------------
-- recipes — new columns for brand-recipe metadata
-- base_recipe_id: variants (Chocolate, Cajeta, Plátano) are deltas over a base
-- recipe; their recipe_ingredients rows store ONLY the changes vs. the base.
-- ----------------------------------------------------------------------------
alter table recipes
  add column slug text,
  add column version text,
  add column machine text check (machine in ('ninja_creami', 'whynter_icm200ls')),
  add column base_recipe_id uuid references recipes(id) on delete restrict,
  add column description text,
  add column process_steps jsonb not null default '[]'::jsonb,
  add column is_lab_verified boolean not null default false,
  add column seasonal boolean not null default false,
  add column notes text;

create unique index recipes_slug_key on recipes (slug) where slug is not null;
create index recipes_base_recipe_idx on recipes (base_recipe_id) where base_recipe_id is not null;

-- ----------------------------------------------------------------------------
-- recipe_ingredients — declared ingredient lines for a brand recipe.
-- Free-text names (they don't need to exist in the ingredients catalog);
-- quantity_g / quantity_ml stay null when the source data gives no number
-- (e.g. "5-10 gotas al gusto"), with quantity_display carrying the human text.
-- ----------------------------------------------------------------------------
create table recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  ingredient_name text not null,
  quantity_g numeric(10, 2),
  quantity_ml numeric(10, 2),
  quantity_display text,
  function text,
  sort_order integer not null default 0
);

create index recipe_ingredients_recipe_idx on recipe_ingredients (recipe_id, sort_order);

-- ----------------------------------------------------------------------------
-- recipe_nutrition — declared nutrition per container (estimated).
-- One row per recipe. Null means "not stated in the source data".
-- ----------------------------------------------------------------------------
create table recipe_nutrition (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null unique references recipes(id) on delete cascade,
  kcal numeric(8, 2),
  protein_g numeric(8, 2),
  fat_total_g numeric(8, 2),
  fat_saturated_g numeric(8, 2),
  fat_trans_g numeric(8, 2),
  carbs_g numeric(8, 2),
  sugars_g numeric(8, 2),
  added_sugars_g numeric(8, 2),
  sodium_mg numeric(8, 2),
  serving_size_g numeric(8, 2)
);

-- ----------------------------------------------------------------------------
-- recipe_nom051_seals — evaluation of each NOM-051 warning seal per recipe.
-- threshold / actual_value are text because units vary per seal
-- (kcal/100 g, % de energía, mg/kcal).
-- ----------------------------------------------------------------------------
create table recipe_nom051_seals (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  seal_name text not null,
  threshold text,
  actual_value text,
  passes boolean not null,
  unique (recipe_id, seal_name)
);

create index recipe_nom051_seals_recipe_idx on recipe_nom051_seals (recipe_id);

-- ----------------------------------------------------------------------------
-- formulation_rules — global brand formulation rules that keep every recipe
-- at cero sellos NOM-051.
-- ----------------------------------------------------------------------------
create table formulation_rules (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null,
  rule text not null,
  rationale text
);

-- ----------------------------------------------------------------------------
-- RLS — same pattern as the rest of the project: enabled with permissive
-- policies until the auth/roles layer exists.
-- ----------------------------------------------------------------------------
alter table recipe_ingredients enable row level security;
alter table recipe_nutrition enable row level security;
alter table recipe_nom051_seals enable row level security;
alter table formulation_rules enable row level security;

create policy "allow all - recipe_ingredients" on recipe_ingredients for all using (true) with check (true);
create policy "allow all - recipe_nutrition" on recipe_nutrition for all using (true) with check (true);
create policy "allow all - recipe_nom051_seals" on recipe_nom051_seals for all using (true) with check (true);
create policy "allow all - formulation_rules" on formulation_rules for all using (true) with check (true);
