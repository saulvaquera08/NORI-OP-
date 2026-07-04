// Hand-written to match supabase/migrations/0001_init.sql.
// Regenerate with `supabase gen types typescript` once the project is linked.

export type IngredientRow = {
  id: string;
  name: string;
  supplier: string | null;
  brand: string | null;
  price_per_kg: number;
  unit: "kg" | "L";
  protein_g_100g: number;
  carbs_g_100g: number;
  fat_g_100g: number;
  fiber_g_100g: number;
  sodium_mg_100g: number;
  sugar_g_100g: number;
  non_metabolizable_carbs_g_100g: number;
  allergens: string[];
  shelf_life_days: number | null;
  stock: number;
  stock_min: number;
  lot_code: string | null;
  location: string | null;
  expires_on: string | null;
  created_at: string;
  updated_at: string;
};

export type RecipeRow = {
  id: string;
  name: string;
  created_at: string;
  slug: string | null;
  version: string | null;
  machine: "ninja_creami" | "whynter_icm200ls" | null;
  base_recipe_id: string | null;
  description: string | null;
  process_steps: string[];
  is_lab_verified: boolean;
  seasonal: boolean;
  notes: string | null;
};

export type RecipeIngredientRow = {
  id: string;
  recipe_id: string;
  ingredient_name: string;
  quantity_g: number | null;
  quantity_ml: number | null;
  quantity_display: string | null;
  function: string | null;
  sort_order: number;
};

export type RecipeNutritionRow = {
  id: string;
  recipe_id: string;
  kcal: number | null;
  protein_g: number | null;
  fat_total_g: number | null;
  fat_saturated_g: number | null;
  fat_trans_g: number | null;
  carbs_g: number | null;
  sugars_g: number | null;
  added_sugars_g: number | null;
  sodium_mg: number | null;
  serving_size_g: number | null;
};

export type RecipeNom051SealRow = {
  id: string;
  recipe_id: string;
  seal_name: string;
  threshold: string | null;
  actual_value: string | null;
  passes: boolean;
};

export type FormulationRuleRow = {
  id: string;
  sort_order: number;
  rule: string;
  rationale: string | null;
};

export type RecipeVersionRow = {
  id: string;
  recipe_id: string;
  version_number: number;
  status: "vigente" | "borrador" | "archivada";
  sell_price: number;
  serving_size_ml: number;
  created_at: string;
};

export type RecipeVersionIngredientRow = {
  id: string;
  recipe_version_id: string;
  ingredient_id: string;
  grams: number;
};

export type InventoryMovementRow = {
  id: string;
  ingredient_id: string;
  type: "entrada" | "salida" | "ajuste";
  quantity: number;
  unit: string;
  description: string;
  reference: string | null;
  created_at: string;
};

export type ProductionOrderRow = {
  id: string;
  code: string;
  recipe_version_id: string;
  operator: string;
  status: "en_proceso" | "completada" | "cancelada";
  lot_code: string | null;
  temperature_c: number | null;
  yield_units: number;
  merma_pct: number;
  cost_per_unit_snapshot: number | null;
  notes: string | null;
  photos: string[];
  produced_at: string;
  created_at: string;
};

export type SalesChannelRow = {
  id: string;
  name: string;
  color: string;
};

export type SalesOrderRow = {
  id: string;
  client_name: string;
  product_name: string;
  channel_id: string;
  payment_method: "tarjeta" | "efectivo" | "transferencia";
  units: number;
  unit_price: number;
  amount: number;
  status: "pagado" | "pendiente";
  created_at: string;
};

export type CompanySettingsRow = {
  id: boolean;
  monthly_sales_goal: number;
};

type Relationships = never[];

export type Database = {
  public: {
    Tables: {
      ingredients: {
        Row: IngredientRow;
        Insert: Partial<IngredientRow> & { name: string };
        Update: Partial<IngredientRow>;
        Relationships: Relationships;
      };
      recipes: {
        Row: RecipeRow;
        Insert: Partial<RecipeRow> & { name: string };
        Update: Partial<RecipeRow>;
        Relationships: Relationships;
      };
      recipe_ingredients: {
        Row: RecipeIngredientRow;
        Insert: Partial<RecipeIngredientRow> & { recipe_id: string; ingredient_name: string };
        Update: Partial<RecipeIngredientRow>;
        Relationships: Relationships;
      };
      recipe_nutrition: {
        Row: RecipeNutritionRow;
        Insert: Partial<RecipeNutritionRow> & { recipe_id: string };
        Update: Partial<RecipeNutritionRow>;
        Relationships: Relationships;
      };
      recipe_nom051_seals: {
        Row: RecipeNom051SealRow;
        Insert: Partial<RecipeNom051SealRow> & { recipe_id: string; seal_name: string; passes: boolean };
        Update: Partial<RecipeNom051SealRow>;
        Relationships: Relationships;
      };
      formulation_rules: {
        Row: FormulationRuleRow;
        Insert: Partial<FormulationRuleRow> & { sort_order: number; rule: string };
        Update: Partial<FormulationRuleRow>;
        Relationships: Relationships;
      };
      recipe_versions: {
        Row: RecipeVersionRow;
        Insert: Partial<RecipeVersionRow> & { recipe_id: string; version_number: number };
        Update: Partial<RecipeVersionRow>;
        Relationships: Relationships;
      };
      recipe_version_ingredients: {
        Row: RecipeVersionIngredientRow;
        Insert: Partial<RecipeVersionIngredientRow> & {
          recipe_version_id: string;
          ingredient_id: string;
        };
        Update: Partial<RecipeVersionIngredientRow>;
        Relationships: Relationships;
      };
      inventory_movements: {
        Row: InventoryMovementRow;
        Insert: Partial<InventoryMovementRow> & {
          ingredient_id: string;
          type: InventoryMovementRow["type"];
          quantity: number;
          unit: string;
          description: string;
        };
        Update: Partial<InventoryMovementRow>;
        Relationships: Relationships;
      };
      production_orders: {
        Row: ProductionOrderRow;
        Insert: Partial<ProductionOrderRow> & { code: string; recipe_version_id: string; operator: string };
        Update: Partial<ProductionOrderRow>;
        Relationships: Relationships;
      };
      sales_channels: {
        Row: SalesChannelRow;
        Insert: Partial<SalesChannelRow> & { name: string; color: string };
        Update: Partial<SalesChannelRow>;
        Relationships: Relationships;
      };
      sales_orders: {
        Row: SalesOrderRow;
        Insert: Partial<Omit<SalesOrderRow, "amount">> & {
          client_name: string;
          product_name: string;
          channel_id: string;
          payment_method: SalesOrderRow["payment_method"];
        };
        Update: Partial<Omit<SalesOrderRow, "amount">>;
        Relationships: Relationships;
      };
      company_settings: {
        Row: CompanySettingsRow;
        Insert: Partial<CompanySettingsRow>;
        Update: Partial<CompanySettingsRow>;
        Relationships: Relationships;
      };
    };
    Views: Record<string, never>;
    Functions: {
      register_inventory_movement: {
        Args: {
          p_ingredient_id: string;
          p_type: "entrada" | "salida";
          p_quantity: number;
          p_note: string | null;
        };
        Returns: undefined;
      };
      set_stock_count: {
        Args: {
          p_ingredient_id: string;
          p_new_stock: number;
          p_note: string | null;
        };
        Returns: undefined;
      };
      create_production_order: {
        Args: {
          p_recipe_version_id: string;
          p_operator: string;
          p_lot_code: string | null;
          p_temperature_c: number | null;
          p_yield_units: number;
          p_merma_pct: number;
          p_notes: string | null;
          p_status?: string;
        };
        Returns: ProductionOrderRow;
      };
    };
  };
};
