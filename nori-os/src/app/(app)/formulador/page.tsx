import { createClient } from "@/lib/supabase/server";
import {
  getIngredientCatalog,
  getRecipeByName,
  getRecipeVersionRows,
  getRecipeVersions,
} from "@/lib/nori/data";
import { FormuladorScreen } from "@/app/(app)/formulador/formulador-screen";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupRequired } from "@/components/nori/setup-required";

export const dynamic = "force-dynamic";

const RECIPE_NAME = "Chocolate Proteico";

export default async function FormuladorPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const { v } = await searchParams;
  const supabase = await createClient();

  const recipe = await getRecipeByName(supabase, RECIPE_NAME);
  const versions = await getRecipeVersions(supabase, recipe.id);

  const selected =
    (v ? versions.find((ver) => String(ver.version_number) === v) : null) ??
    versions.find((ver) => ver.status === "vigente") ??
    versions[0];

  const [rows, catalog] = await Promise.all([
    getRecipeVersionRows(supabase, selected.id),
    getIngredientCatalog(supabase),
  ]);

  return (
    <FormuladorScreen
      recipeName={recipe.name}
      versions={versions.map((ver) => ({ id: ver.id, versionNumber: ver.version_number, status: ver.status }))}
      selectedVersionId={selected.id}
      selectedVersionNumber={selected.version_number}
      selectedStatus={selected.status}
      sellPrice={Number(selected.sell_price)}
      initialRows={rows.map((r) => ({ ingredient: r.ingredient, grams: r.grams }))}
      catalog={catalog.map((i) => ({
        id: i.id,
        name: i.name,
        pricePerKg: Number(i.price_per_kg),
        proteinG100g: Number(i.protein_g_100g),
        carbsG100g: Number(i.carbs_g_100g),
        fatG100g: Number(i.fat_g_100g),
        fiberG100g: Number(i.fiber_g_100g),
        sodiumMg100g: Number(i.sodium_mg_100g),
        sugarG100g: Number(i.sugar_g_100g),
      }))}
    />
  );
}
