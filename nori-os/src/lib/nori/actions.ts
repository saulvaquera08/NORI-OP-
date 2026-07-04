"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateRecipeIngredientGrams(
  recipeVersionId: string,
  ingredientId: string,
  grams: number
) {
  const supabase = await createClient();
  const safeGrams = Math.max(0, Number.isFinite(grams) ? grams : 0);
  const { error } = await supabase
    .from("recipe_version_ingredients")
    .update({ grams: safeGrams })
    .eq("recipe_version_id", recipeVersionId)
    .eq("ingredient_id", ingredientId);
  if (error) throw error;
  revalidatePath("/formulador");
  revalidatePath("/nutrimental");
  revalidatePath("/dashboard");
}

export async function addRecipeIngredient(recipeVersionId: string, ingredientId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("recipe_version_ingredients")
    .upsert(
      { recipe_version_id: recipeVersionId, ingredient_id: ingredientId, grams: 50 },
      { onConflict: "recipe_version_id,ingredient_id", ignoreDuplicates: true }
    );
  if (error) throw error;
  revalidatePath("/formulador");
  revalidatePath("/nutrimental");
  revalidatePath("/dashboard");
}

export async function removeRecipeIngredient(recipeVersionId: string, ingredientId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("recipe_version_ingredients")
    .delete()
    .eq("recipe_version_id", recipeVersionId)
    .eq("ingredient_id", ingredientId);
  if (error) throw error;
  revalidatePath("/formulador");
  revalidatePath("/nutrimental");
  revalidatePath("/dashboard");
}

// Congela los gramos actuales de una versión como una NUEVA versión inmutable
// (V(n+1) vigente); la anterior pasa a archivada. Nunca se borra nada.
export async function saveAsNewVersion(recipeVersionId: string) {
  const supabase = await createClient();

  const { data: current, error: versionError } = await supabase
    .from("recipe_versions")
    .select("*")
    .eq("id", recipeVersionId)
    .single();
  if (versionError) throw versionError;

  const { data: rows, error: rowsError } = await supabase
    .from("recipe_version_ingredients")
    .select("ingredient_id, grams")
    .eq("recipe_version_id", recipeVersionId);
  if (rowsError) throw rowsError;

  const { data: maxRows, error: maxError } = await supabase
    .from("recipe_versions")
    .select("version_number")
    .eq("recipe_id", current.recipe_id)
    .order("version_number", { ascending: false })
    .limit(1);
  if (maxError) throw maxError;
  const nextNumber = (maxRows?.[0]?.version_number ?? current.version_number) + 1;

  // archivar la vigente antes de crear la nueva (índice único parcial "vigente")
  const { error: archiveError } = await supabase
    .from("recipe_versions")
    .update({ status: "archivada" })
    .eq("id", current.id);
  if (archiveError) throw archiveError;

  const { data: created, error: createError } = await supabase
    .from("recipe_versions")
    .insert({
      recipe_id: current.recipe_id,
      version_number: nextNumber,
      status: "vigente",
      sell_price: current.sell_price,
      serving_size_ml: current.serving_size_ml,
    })
    .select()
    .single();
  if (createError) {
    // restaurar la vigente si la creación falló
    await supabase.from("recipe_versions").update({ status: "vigente" }).eq("id", current.id);
    throw createError;
  }

  if ((rows ?? []).length > 0) {
    const { error: copyError } = await supabase.from("recipe_version_ingredients").insert(
      (rows ?? []).map((r) => ({
        recipe_version_id: created.id,
        ingredient_id: r.ingredient_id,
        grams: r.grams,
      }))
    );
    if (copyError) throw copyError;
  }

  revalidatePath("/formulador");
  revalidatePath("/nutrimental");
  revalidatePath("/produccion");
  return { newVersionNumber: nextNumber };
}

export async function createRecipeWithVersion(name: string) {
  const supabase = await createClient();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("El nombre de la receta es obligatorio.");

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({ name: trimmed })
    .select()
    .single();
  if (recipeError) throw recipeError;

  const { error: versionError } = await supabase.from("recipe_versions").insert({
    recipe_id: recipe.id,
    version_number: 1,
    status: "vigente",
    sell_price: 130,
    serving_size_ml: 475,
  });
  if (versionError) throw versionError;

  revalidatePath("/formulador");
  return { recipeId: recipe.id };
}

export async function registerInventoryMovement(input: {
  ingredientId: string;
  type: "entrada" | "salida";
  quantity: number;
  note: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("register_inventory_movement", {
    p_ingredient_id: input.ingredientId,
    p_type: input.type,
    p_quantity: input.quantity,
    p_note: input.note || null,
  });
  if (error) throw error;
  revalidatePath("/inventario");
  revalidatePath("/dashboard");
}

export async function setStockCount(input: { ingredientId: string; newStock: number; note: string }) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_stock_count", {
    p_ingredient_id: input.ingredientId,
    p_new_stock: input.newStock,
    p_note: input.note || null,
  });
  if (error) throw error;
  revalidatePath("/inventario");
  revalidatePath("/dashboard");
}

export async function updateStockMin(ingredientId: string, stockMin: number) {
  const supabase = await createClient();
  const safeMin = Math.max(0, Number.isFinite(stockMin) ? stockMin : 0);
  const { error } = await supabase.from("ingredients").update({ stock_min: safeMin }).eq("id", ingredientId);
  if (error) throw error;
  revalidatePath("/inventario");
  revalidatePath("/dashboard");
}

export async function createSale(input: {
  clientName: string;
  productName: string;
  channelId: string;
  units: number;
  unitPrice: number;
  paymentMethod: "tarjeta" | "efectivo" | "transferencia";
  status: "pagado" | "pendiente";
}) {
  const supabase = await createClient();
  if (!input.clientName.trim()) throw new Error("El cliente es obligatorio.");
  if (!input.productName.trim()) throw new Error("El producto es obligatorio.");
  if (!input.channelId) throw new Error("El canal es obligatorio.");
  if (!(input.units > 0)) throw new Error("Las unidades deben ser mayores a cero.");
  if (!(input.unitPrice >= 0)) throw new Error("Precio inválido.");

  const { error } = await supabase.from("sales_orders").insert({
    client_name: input.clientName.trim(),
    product_name: input.productName.trim(),
    channel_id: input.channelId,
    units: Math.round(input.units),
    unit_price: input.unitPrice,
    payment_method: input.paymentMethod,
    status: input.status,
  });
  if (error) throw error;
  revalidatePath("/ventas");
  revalidatePath("/dashboard");
}

export async function createProductionOrder(input: {
  recipeVersionId: string;
  operator: string;
  lotCode: string;
  temperatureC: number | null;
  yieldUnits: number;
  mermaPct: number;
  notes: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_production_order", {
    p_recipe_version_id: input.recipeVersionId,
    p_operator: input.operator,
    p_lot_code: input.lotCode || null,
    p_temperature_c: input.temperatureC,
    p_yield_units: input.yieldUnits,
    p_merma_pct: input.mermaPct,
    p_notes: input.notes || null,
    p_status: "en_proceso",
  });
  if (error) throw error;
  revalidatePath("/produccion");
  revalidatePath("/inventario");
  revalidatePath("/dashboard");
}

