export type IngredientNutrition = {
  id: string;
  name: string;
  // 'kg' se captura en g; 'L' se captura en ml (1 ml ≈ 1 g, densidad ~1).
  unit: "kg" | "L";
  pricePerKg: number;
  proteinG100g: number;
  carbsG100g: number;
  fatG100g: number;
  fiberG100g: number;
  sodiumMg100g: number;
  sugarG100g: number;
  // Fracción de los carbohidratos que no aporta energía (p. ej. alulosa).
  nonMetabCarbsG100g: number;
};

export type RecipeRowInput = {
  ingredient: IngredientNutrition;
  grams: number;
};

// Porción por defecto: pinta NORI (475 ml).
const DEFAULT_SERVING_ML = 475;
const DEFAULT_SELL_PRICE = 130;

export function computeRecipeCalc(
  rows: RecipeRowInput[],
  sellPrice = DEFAULT_SELL_PRICE,
  servingMl = DEFAULT_SERVING_ML
) {
  const totalGrams = rows.reduce((a, r) => a + r.grams, 0) || 0;
  const totalCost = rows.reduce((a, r) => a + (r.grams * r.ingredient.pricePerKg) / 1000, 0);

  const totals = { protein: 0, carbs: 0, metabCarbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 };
  for (const r of rows) {
    const f = r.grams / 100;
    totals.protein += f * r.ingredient.proteinG100g;
    totals.carbs += f * r.ingredient.carbsG100g;
    totals.metabCarbs += f * Math.max(0, r.ingredient.carbsG100g - r.ingredient.nonMetabCarbsG100g);
    totals.fat += f * r.ingredient.fatG100g;
    totals.fiber += f * r.ingredient.fiberG100g;
    totals.sodium += f * r.ingredient.sodiumMg100g;
    totals.sugar += f * r.ingredient.sugarG100g;
  }

  const volumeMl = totalGrams / 1.05;
  const liters = volumeMl / 1000;
  const porciones = Math.max(1, Math.floor(volumeMl / servingMl));

  const costPerLiter = totalCost / (liters || 1);
  const costPerVaso = totalCost / porciones;

  const proteinVaso = totals.protein / porciones;
  const carbsVaso = totals.carbs / porciones;
  const fatVaso = totals.fat / porciones;
  const fiberVaso = totals.fiber / porciones;
  const sodiumVaso = totals.sodium / porciones;
  const sugarVaso = totals.sugar / porciones;
  // kcal solo sobre carbohidratos metabolizables (la alulosa no cuenta).
  const caloriesVaso = (totals.protein * 4 + totals.metabCarbs * 4 + totals.fat * 9) / porciones;

  const per100g = (v: number) => (totalGrams > 0 ? (v / totalGrams) * 100 : 0);
  const kcalPer100g =
    totalGrams > 0
      ? ((totals.protein * 4 + totals.metabCarbs * 4 + totals.fat * 9) / totalGrams) * 100
      : 0;

  const margin = sellPrice > 0 ? ((sellPrice - costPerVaso) / sellPrice) * 100 : 0;

  return {
    totalGrams,
    totalCost,
    totals,
    volumeMl,
    liters,
    vasos: porciones,
    servingMl,
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

// Heurística NOM-051 simplificada (umbrales de sólidos, por 100 g). El
// cumplimiento real requiere validación de laboratorio — la UI lo indica.
// Nota: el catálogo no distingue grasa saturada; se compara la grasa TOTAL
// contra el umbral de saturadas (conservador: sobre-alerta, nunca sub-alerta).
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
    seals.push({ label: "Grasa total sobre umbral de saturadas (conservador)", status: "warning" });
  } else if (fatPer100 > 3) {
    seals.push({ label: "Grasas cerca del límite (conservador)", status: "warning" });
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
