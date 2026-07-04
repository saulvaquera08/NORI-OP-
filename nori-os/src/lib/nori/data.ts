import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, IngredientRow } from "@/lib/supabase/types";
import type { IngredientNutrition, RecipeRowInput } from "@/lib/nori/recipe-calc";

type Client = SupabaseClient<Database>;

export function toIngredientNutrition(i: IngredientRow): IngredientNutrition {
  return {
    id: i.id,
    name: i.name,
    pricePerKg: i.price_per_kg,
    proteinG100g: i.protein_g_100g,
    carbsG100g: i.carbs_g_100g,
    fatG100g: i.fat_g_100g,
    fiberG100g: i.fiber_g_100g,
    sodiumMg100g: i.sodium_mg_100g,
    sugarG100g: i.sugar_g_100g,
  };
}

export async function getIngredientCatalog(supabase: Client) {
  const { data, error } = await supabase.from("ingredients").select("*").order("name");
  if (error) throw error;
  return data;
}

// First recipe that actually has formulador versions, or null when the
// formulador has nothing to work on yet (e.g. fresh database).
export async function getPrimaryFormuladorRecipe(supabase: Client) {
  const { data: anyVersion, error: versionError } = await supabase
    .from("recipe_versions")
    .select("recipe_id, recipe:recipes(*)")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (versionError) throw versionError;
  if (!anyVersion?.recipe) return null;

  const recipe = anyVersion.recipe as unknown as { id: string; name: string };
  const versions = await getRecipeVersions(supabase, recipe.id);
  if (versions.length === 0) return null;
  return { recipe, versions };
}

export async function getRecipeVersions(supabase: Client, recipeId: string) {
  const { data, error } = await supabase
    .from("recipe_versions")
    .select("*")
    .eq("recipe_id", recipeId)
    .order("version_number", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getRecipeVersionRows(supabase: Client, recipeVersionId: string): Promise<RecipeRowInput[]> {
  const { data, error } = await supabase
    .from("recipe_version_ingredients")
    .select("grams, ingredient:ingredients(*)")
    .eq("recipe_version_id", recipeVersionId);
  if (error) throw error;
  return (data ?? [])
    .filter((row) => row.ingredient)
    .map((row) => ({
      grams: Number(row.grams),
      ingredient: toIngredientNutrition(row.ingredient as unknown as IngredientRow),
    }));
}

