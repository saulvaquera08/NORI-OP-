import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  IngredientRow,
  RecipeIngredientRow,
  RecipeNom051SealRow,
  RecipeNutritionRow,
  RecipeRow,
} from "@/lib/supabase/types";
import type { IngredientNutrition, RecipeRowInput } from "@/lib/nori/recipe-calc";

type Client = SupabaseClient<Database>;

export type BrandRecipe = RecipeRow & {
  ingredients: RecipeIngredientRow[];
  nutrition: RecipeNutritionRow | null;
  seals: RecipeNom051SealRow[];
  base: RecipeRow | null;
};

// Brand recipe book: flat selects joined in JS (tiny tables; keeps the REST
// layer trivial so QA fixtures can mirror production exactly).
export async function getBrandRecipeData(supabase: Client) {
  const [recipesRes, ingredientsRes, nutritionRes, sealsRes, rulesRes] = await Promise.all([
    supabase.from("recipes").select("*").not("slug", "is", null).order("created_at"),
    supabase.from("recipe_ingredients").select("*").order("sort_order"),
    supabase.from("recipe_nutrition").select("*"),
    supabase.from("recipe_nom051_seals").select("*").order("seal_name"),
    supabase.from("formulation_rules").select("*").order("sort_order"),
  ]);
  for (const res of [recipesRes, ingredientsRes, nutritionRes, sealsRes, rulesRes]) {
    if (res.error) throw res.error;
  }

  const recipes = recipesRes.data ?? [];
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const brandRecipes: BrandRecipe[] = recipes.map((r) => ({
    ...r,
    ingredients: (ingredientsRes.data ?? []).filter((i) => i.recipe_id === r.id),
    nutrition: (nutritionRes.data ?? []).find((n) => n.recipe_id === r.id) ?? null,
    seals: (sealsRes.data ?? []).filter((s) => s.recipe_id === r.id),
    base: r.base_recipe_id ? (byId.get(r.base_recipe_id) ?? null) : null,
  }));

  return { recipes: brandRecipes, rules: rulesRes.data ?? [] };
}

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

