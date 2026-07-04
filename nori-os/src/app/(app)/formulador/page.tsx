import { createClient } from "@/lib/supabase/server";
import {
  getFormuladorRecipes,
  getIngredientCatalog,
  getRecipeVersionRows,
  toIngredientNutrition,
} from "@/lib/nori/data";
import { FormuladorScreen } from "@/app/(app)/formulador/formulador-screen";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupRequired } from "@/components/nori/setup-required";
import { EmptyState } from "@/components/nori/empty-state";
import { NuevaRecetaForm } from "@/app/(app)/formulador/nueva-receta-form";

export const dynamic = "force-dynamic";

export default async function FormuladorPage({
  searchParams,
}: {
  searchParams: Promise<{ rec?: string; v?: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const { rec, v } = await searchParams;
  const supabase = await createClient();

  const [recipeGroups, catalogRows] = await Promise.all([
    getFormuladorRecipes(supabase),
    getIngredientCatalog(supabase),
  ]);
  const catalog = catalogRows.map(toIngredientNutrition);

  if (recipeGroups.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-nori-border p-6">
          <NuevaRecetaForm />
        </div>
        <EmptyState
          title="Aún no hay recetas en el formulador"
          description="Crea tu primera receta con el botón de arriba. Podrás armarla con los ingredientes del catálogo, ver costo y nutrición en vivo, y guardar cada ajuste como una nueva versión inmutable."
        />
      </div>
    );
  }

  const group = (rec ? recipeGroups.find((g) => g.recipe.id === rec) : null) ?? recipeGroups[0];
  const versions = group.versions;
  const selected =
    (v ? versions.find((ver) => String(ver.version_number) === v) : null) ??
    versions.find((ver) => ver.status === "vigente") ??
    versions[0];

  const rows = await getRecipeVersionRows(supabase, selected.id);

  return (
    <FormuladorScreen
      recipes={recipeGroups.map((g) => g.recipe)}
      recipeId={group.recipe.id}
      recipeName={group.recipe.name}
      versions={versions.map((ver) => ({ id: ver.id, versionNumber: ver.version_number, status: ver.status }))}
      selectedVersionId={selected.id}
      selectedVersionNumber={selected.version_number}
      selectedStatus={selected.status}
      sellPrice={Number(selected.sell_price)}
      servingMl={Number(selected.serving_size_ml)}
      initialRows={rows.map((r) => ({ ingredient: r.ingredient, grams: r.grams }))}
      catalog={catalog}
    />
  );
}
