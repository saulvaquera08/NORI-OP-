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

const AI_RESPONSES = [
  "Analizando tu base de recetas… la V5 de Chocolate Proteico tiene el mejor margen actual.",
  "El precio de la Whey Isolate es el ingrediente con mayor variación de costo en tu catálogo este trimestre.",
  "Con tu inventario actual de leche, puedo estimar varios lotes más antes de necesitar una nueva compra.",
  "Genial — puedo preparar un borrador de receta optimizada para menor costo manteniendo la proteína objetivo. ¿Lo agrego como nueva versión?",
];

export async function sendChatMessage(conversationId: string | null, text: string) {
  const supabase = await createClient();
  const trimmed = text.trim();
  if (!trimmed) return { conversationId };

  let convId = conversationId;
  if (!convId) {
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ title: trimmed.slice(0, 40) })
      .select()
      .single();
    if (error) throw error;
    convId = data.id;
  }

  const { error: userMsgError } = await supabase
    .from("chat_messages")
    .insert({ conversation_id: convId, role: "user", content: trimmed });
  if (userMsgError) throw userMsgError;

  const aiReply = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
  const { error: aiMsgError } = await supabase
    .from("chat_messages")
    .insert({ conversation_id: convId, role: "assistant", content: aiReply });
  if (aiMsgError) throw aiMsgError;

  revalidatePath("/nori-ai");
  return { conversationId: convId };
}

export async function createChatConversation() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({ title: "Nueva conversación" })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/nori-ai");
  return data.id;
}
