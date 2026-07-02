export type IngredientNutrition = {
  id: string;
  name: string;
  pricePerKg: number;
  proteinG100g: number;
  carbsG100g: number;
  fatG100g: number;
  fiberG100g: number;
  sodiumMg100g: number;
  sugarG100g: number;
};

export type RecipeRowInput = {
  ingredient: IngredientNutrition;
  grams: number;
};

const VASO_ML = 240;
const DEFAULT_SELL_PRICE = 89;

export function computeRecipeCalc(rows: RecipeRowInput[], sellPrice = DEFAULT_SELL_PRICE) {
  const totalGrams = rows.reduce((a, r) => a + r.grams, 0) || 0;
  const totalCost = rows.reduce((a, r) => a + (r.grams * r.ingredient.pricePerKg) / 1000, 0);

  const totals = { protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 };
  for (const r of rows) {
    const f = r.grams / 100;
    totals.protein += f * r.ingredient.proteinG100g;
    totals.carbs += f * r.ingredient.carbsG100g;
    totals.fat += f * r.ingredient.fatG100g;
    totals.fiber += f * r.ingredient.fiberG100g;
    totals.sodium += f * r.ingredient.sodiumMg100g;
    totals.sugar += f * r.ingredient.sugarG100g;
  }

  const volumeMl = totalGrams / 1.05;
  const liters = volumeMl / 1000;
  const vasos = Math.max(1, Math.floor(volumeMl / VASO_ML));

  const costPerLiter = totalCost / (liters || 1);
  const costPerVaso = totalCost / vasos;

  const proteinVaso = totals.protein / vasos;
  const carbsVaso = totals.carbs / vasos;
  const fatVaso = totals.fat / vasos;
  const fiberVaso = totals.fiber / vasos;
  const sodiumVaso = totals.sodium / vasos;
  const sugarVaso = totals.sugar / vasos;
  const caloriesVaso = proteinVaso * 4 + carbsVaso * 4 + fatVaso * 9;

  const per100g = (v: number) => (totalGrams > 0 ? (v / totalGrams) * 100 : 0);
  const kcalPer100g = totalGrams > 0 ? ((totals.protein * 4 + totals.carbs * 4 + totals.fat * 9) / totalGrams) * 100 : 0;

  const margin = sellPrice > 0 ? ((sellPrice - costPerVaso) / sellPrice) * 100 : 0;

  return {
    totalGrams,
    totalCost,
    totals,
    volumeMl,
    liters,
    vasos,
    costPerLiter,
    costPerVaso,
    proteinVaso,
    carbsVaso,
    fatVaso,
    fiberVaso,
    sodiumVaso,
    sugarVaso,
    caloriesVaso,
    per100g,
    kcalPer100g,
    margin,
    sellPrice,
  };
}

export type NomSeal = { label: string; status: "ok" | "warning" | "exceso" };

// Simplified NOM-051 heuristic (solid-food thresholds, per 100g). Real
// compliance requires lab validation — surfaced explicitly in the UI.
export function computeNomSeals(calc: ReturnType<typeof computeRecipeCalc>): NomSeal[] {
  const seals: NomSeal[] = [];

  const sugarPer100 = calc.per100g(calc.totals.sugar);
  if (sugarPer100 > 10) {
    seals.push({ label: "Exceso de azúcares", status: "exceso" });
  } else if (sugarPer100 > 7.5) {
    seals.push({ label: "Azúcares cerca del límite", status: "warning" });
  } else {
    seals.push({ label: "Sin exceso de azúcares", status: "ok" });
  }

  if (calc.kcalPer100g > 275) {
    seals.push({ label: "Exceso de calorías", status: "exceso" });
  } else if (calc.kcalPer100g > 220) {
    seals.push({ label: "Calorías cerca del límite", status: "warning" });
  } else {
    seals.push({ label: "Sin exceso de calorías", status: "ok" });
  }

  const fatPer100 = calc.per100g(calc.totals.fat);
  if (fatPer100 > 4) {
    seals.push({ label: "Exceso de grasas saturadas", status: "exceso" });
  } else if (fatPer100 > 3) {
    seals.push({ label: "Grasas saturadas cerca del límite", status: "warning" });
  } else {
    seals.push({ label: "Sin exceso de grasas saturadas", status: "ok" });
  }

  const sodiumPer100 = calc.per100g(calc.totals.sodium);
  if (sodiumPer100 > 300) {
    seals.push({ label: "Exceso de sodio", status: "exceso" });
  } else if (sodiumPer100 > 240) {
    seals.push({ label: "Sodio cerca del límite", status: "warning" });
  } else {
    seals.push({ label: "Sin exceso de sodio", status: "ok" });
  }

  return seals;
}
