-- NORI OS — datos del recetario de marca NORI (nieve proteica)
-- Fuente: formulación V6 Simple + variantes, proporcionada por el fundador.
-- Macros estimados con tablas estándar de ingredientes — NO son análisis de
-- laboratorio (is_lab_verified = false en todas).
--
-- Modelo:
--   · Dos bases "V6 Simple": Ninja Creami (activa, con glicerina) y
--     Whynter ICM-200LS (futura, sin glicerina). Llevan su lista completa
--     de ingredientes.
--   · Las variantes (Chocolate, Cajeta, Plátano) apuntan a la base Creami vía
--     base_recipe_id y sus recipe_ingredients contienen SOLO los cambios.

-- ----------------------------------------------------------------------------
-- Recetas
-- ----------------------------------------------------------------------------
insert into recipes (id, name, slug, version, machine, base_recipe_id, description, process_steps, is_lab_verified, seasonal, notes) values
(
  'f0000000-0000-4000-8000-000000000001',
  'Base V6 Simple · Ninja Creami',
  'base-v6-simple-creami',
  'V6',
  'ninja_creami',
  null,
  'Base común del recetario NORI por pinta (~475 ml). Versión activa para Ninja Creami — lleva glicerina para scoopabilidad post-congelado.',
  '[
    "Tibia la leche a ~45-50 °C. Disuelve alulosa, xantana, glicerina y vainilla.",
    "Licúa todo + Isopure + aceite + lecitina, 30-40 seg hasta homogéneo.",
    "Vierte al vaso del Creami. Congela 24 h en plano.",
    "Procesa en ciclo \"Lite Ice Cream\". Si sale polvoso, re-spin con un chorrito de leche."
  ]'::jsonb,
  false,
  false,
  'Azúcares 17 g = lactosa, no añadida. Cumple cero sellos NOM-051 si se respetan las reglas de formulación.'
),
(
  'f0000000-0000-4000-8000-000000000002',
  'Base V6 Simple · Whynter',
  'base-v6-simple-whynter',
  'V6',
  'whynter_icm200ls',
  null,
  'Misma base V6 Simple sin glicerina (7 ingredientes). Versión futura para Whynter ICM-200LS.',
  '[
    "Tibia la leche a ~45-50 °C. Disuelve alulosa, xantana y vainilla.",
    "Licúa todo + Isopure + aceite + lecitina hasta homogéneo.",
    "Enfría (refri 1-2 h o baño de hielo).",
    "Churna 30-50 min. Pasa a envase pre-congelado y endurece 2-4 h."
  ]'::jsonb,
  false,
  false,
  'Carbohidratos ~64 g incluyen 45 g de alulosa no metabolizable. Azúcares 17 g = lactosa. Por 100 g: 91 kcal · 8.6 g proteína · 3.9 g grasa · 0.4 g saturada · sodio 78 mg.'
),
(
  'f0000000-0000-4000-8000-000000000003',
  'Variante Chocolate',
  'variante-chocolate',
  null,
  'ninja_creami',
  'f0000000-0000-4000-8000-000000000001',
  'Delta sobre Base V6 Simple (Ninja Creami).',
  '[]'::jsonb,
  false,
  false,
  'NOTA CRÍTICA: el cacao alcalinizado lleva carbonatos de sodio y sube el ratio sodio/kcal a 0.87 — todavía pasa pero se come el margen. Usar cacao natural (ej. Hershey''s Natural; NO "Special Dark"). Dutch process prohibido.'
),
(
  'f0000000-0000-4000-8000-000000000004',
  'Variante Cajeta',
  'variante-cajeta',
  null,
  'ninja_creami',
  'f0000000-0000-4000-8000-000000000001',
  'Delta sobre Base V6 Simple (Ninja Creami).',
  '[
    "Caramelizar ~20 g de la alulosa en seco (calentar hasta color ámbar) antes de integrarla — da sabor y color caramelo real."
  ]'::jsonb,
  false,
  false,
  'NOTA CRÍTICA: CERO cajeta real — es azúcar caramelizada pura y dispara el sello de azúcares con un par de cucharadas. El sabor caramelo se logra 100% con alulosa caramelizada + saborizante sin azúcar (la alulosa sí participa en Maillard).'
),
(
  'f0000000-0000-4000-8000-000000000005',
  'Variante Plátano',
  'variante-platano',
  null,
  'ninja_creami',
  'f0000000-0000-4000-8000-000000000001',
  'Edición especial / estacional. Delta sobre Base V6 Simple (Ninja Creami).',
  '[]'::jsonb,
  false,
  true,
  'NOTA CRÍTICA: techo duro de 60-70 g de plátano por pinta. A 80 g el azúcar libre llega justo a 10% = SELLO. Si se quiere más intensidad, reforzar con extracto, nunca con más fruta. La alulosa se mantiene en 45 g. Este sabor NO es del lineup core (Vainilla, Chocolate, Cajeta, Cookies & Cream).'
);

-- ----------------------------------------------------------------------------
-- Ingredientes — Base V6 Simple · Ninja Creami (lista completa, por pinta)
-- ----------------------------------------------------------------------------
insert into recipe_ingredients (recipe_id, ingredient_name, quantity_g, quantity_ml, quantity_display, function, sort_order) values
('f0000000-0000-4000-8000-000000000001', 'Leche descremada LALA Light 0%',             null, 300,  '300 ml',          'Base láctea', 1),
('f0000000-0000-4000-8000-000000000001', 'Isopure WPI sin sabor',                      28,   null, '1 scoop (28 g)',  'Proteína', 2),
('f0000000-0000-4000-8000-000000000001', 'Alulosa (Natural Wisdom)',                   45,   null, '45 g',            'Edulcorante / bulk / anticristalización', 3),
('f0000000-0000-4000-8000-000000000001', 'Aceite alto oleico (girasol o aguacate)',    13,   null, '13 g',            'Calorías estructurales (mantiene ratio sodio/kcal < 1)', 4),
('f0000000-0000-4000-8000-000000000001', 'Lecitina de girasol',                        2,    null, '2 g',             'Emulsificante', 5),
('f0000000-0000-4000-8000-000000000001', 'Goma xantana',                               1.5,  null, '1.5 g',           'Estabilizante', 6),
('f0000000-0000-4000-8000-000000000001', 'Vainilla Molina',                            null, 10,   '10 ml',           'Sabor', 7),
('f0000000-0000-4000-8000-000000000001', 'Glicerina vegetal (USP grado alimenticio)',  5,    null, '5 g',             'Scoopabilidad post-congelado (solo Creami)', 8);

-- ----------------------------------------------------------------------------
-- Ingredientes — Base V6 Simple · Whynter (misma base sin glicerina)
-- ----------------------------------------------------------------------------
insert into recipe_ingredients (recipe_id, ingredient_name, quantity_g, quantity_ml, quantity_display, function, sort_order) values
('f0000000-0000-4000-8000-000000000002', 'Leche descremada LALA Light 0%',             null, 300,  '300 ml',          'Base láctea', 1),
('f0000000-0000-4000-8000-000000000002', 'Isopure WPI sin sabor',                      28,   null, '1 scoop (28 g)',  'Proteína', 2),
('f0000000-0000-4000-8000-000000000002', 'Alulosa (Natural Wisdom)',                   45,   null, '45 g',            'Edulcorante / bulk / anticristalización', 3),
('f0000000-0000-4000-8000-000000000002', 'Aceite alto oleico (girasol o aguacate)',    13,   null, '13 g',            'Calorías estructurales (mantiene ratio sodio/kcal < 1)', 4),
('f0000000-0000-4000-8000-000000000002', 'Lecitina de girasol',                        2,    null, '2 g',             'Emulsificante', 5),
('f0000000-0000-4000-8000-000000000002', 'Goma xantana',                               1.5,  null, '1.5 g',           'Estabilizante', 6),
('f0000000-0000-4000-8000-000000000002', 'Vainilla Molina',                            null, 10,   '10 ml',           'Sabor', 7);

-- ----------------------------------------------------------------------------
-- Ingredientes — Variante Chocolate (solo cambios vs. base)
-- ----------------------------------------------------------------------------
insert into recipe_ingredients (recipe_id, ingredient_name, quantity_g, quantity_ml, quantity_display, function, sort_order) values
('f0000000-0000-4000-8000-000000000003', 'Cacao en polvo natural desgrasado, sin alcalinizar', 12, null, '12 g (~2 cdas)', 'Sabor — Dutch process prohibido', 1),
('f0000000-0000-4000-8000-000000000003', 'Alulosa (Natural Wisdom)', 58, null, '58 g (sube de 45 g)', 'Edulcorante — compensa amargor del cacao', 2),
('f0000000-0000-4000-8000-000000000003', 'Café instantáneo (opcional)', null, null, 'pizca', 'Profundidad de sabor', 3);

-- ----------------------------------------------------------------------------
-- Ingredientes — Variante Cajeta (solo cambios vs. base)
-- ----------------------------------------------------------------------------
insert into recipe_ingredients (recipe_id, ingredient_name, quantity_g, quantity_ml, quantity_display, function, sort_order) values
('f0000000-0000-4000-8000-000000000004', 'Alulosa (Natural Wisdom)', 58, null, '58 g total (~20 g caramelizada en seco hasta color ámbar)', 'Edulcorante + sabor y color caramelo real', 1),
('f0000000-0000-4000-8000-000000000004', 'Saborizante de cajeta / dulce de leche / caramelo sin azúcar', null, null, '~5-10 gotas al gusto', 'Sabor', 2),
('f0000000-0000-4000-8000-000000000004', 'Saborizante mantequilla (opcional)', null, null, '1-2 gotas', 'Notas lácteas', 3);

-- ----------------------------------------------------------------------------
-- Ingredientes — Variante Plátano (solo cambios vs. base)
-- ----------------------------------------------------------------------------
insert into recipe_ingredients (recipe_id, ingredient_name, quantity_g, quantity_ml, quantity_display, function, sort_order) values
('f0000000-0000-4000-8000-000000000005', 'Plátano maduro', 60, null, '60 g máximo (~½ plátano chico)', 'Sabor — techo duro por azúcar libre', 1),
('f0000000-0000-4000-8000-000000000005', 'Extracto / saborizante de plátano sin azúcar', null, null, 'al gusto', 'Intensidad sin subir azúcar', 2),
('f0000000-0000-4000-8000-000000000005', 'Jugo de limón', null, null, 'unas gotas', 'Evita oxidación / pardeo', 3);

-- ----------------------------------------------------------------------------
-- Nutrición estimada por envase (null = no declarado en la fuente)
-- ----------------------------------------------------------------------------
insert into recipe_nutrition (recipe_id, kcal, protein_g, fat_total_g, fat_saturated_g, fat_trans_g, carbs_g, sugars_g, added_sugars_g, sodium_mg, serving_size_g) values
('f0000000-0000-4000-8000-000000000001', 395, 35.2, null, 1.6, 0.2, null, 17, 2, 319, 414),
('f0000000-0000-4000-8000-000000000002', 373, 35.2, 16.1, 1.6, 0.2, 64, 17, 2, 319, 408),
('f0000000-0000-4000-8000-000000000003', 428, 38,   null, null, null, null, null, null, null, null),
('f0000000-0000-4000-8000-000000000004', 400, 35,   null, null, null, null, null, null, null, null),
('f0000000-0000-4000-8000-000000000005', 448, 36,   null, null, null, null, null, null, null, null);

-- ----------------------------------------------------------------------------
-- Sellos NOM-051 — los umbrales son las constantes de la norma citadas en la
-- fuente; actual_value solo donde la fuente lo declara.
-- ----------------------------------------------------------------------------
-- Base Creami: "todos ✅" (sin valores declarados por sello)
insert into recipe_nom051_seals (recipe_id, seal_name, threshold, actual_value, passes) values
('f0000000-0000-4000-8000-000000000001', 'Exceso de calorías',         '275 kcal/100 g',  null, true),
('f0000000-0000-4000-8000-000000000001', 'Exceso de azúcares',         '10% de energía',  null, true),
('f0000000-0000-4000-8000-000000000001', 'Exceso de grasas saturadas', '10% de energía',  null, true),
('f0000000-0000-4000-8000-000000000001', 'Exceso de grasas trans',     '1% de energía',   null, true),
('f0000000-0000-4000-8000-000000000001', 'Exceso de sodio',            '1.0 mg/kcal',     null, true);

-- Base Whynter: valores declarados por sello
insert into recipe_nom051_seals (recipe_id, seal_name, threshold, actual_value, passes) values
('f0000000-0000-4000-8000-000000000002', 'Exceso de calorías',         '275 kcal/100 g',  '91 kcal/100 g',  true),
('f0000000-0000-4000-8000-000000000002', 'Exceso de azúcares',         '10% de energía',  '2.1% en',        true),
('f0000000-0000-4000-8000-000000000002', 'Exceso de grasas saturadas', '10% de energía',  '3.9% en',        true),
('f0000000-0000-4000-8000-000000000002', 'Exceso de grasas trans',     '1% de energía',   '0.1% en',        true),
('f0000000-0000-4000-8000-000000000002', 'Exceso de sodio',            '1.0 mg/kcal',     '0.86 mg/kcal',   true);

-- Variante Chocolate
insert into recipe_nom051_seals (recipe_id, seal_name, threshold, actual_value, passes) values
('f0000000-0000-4000-8000-000000000003', 'Exceso de calorías',         '275 kcal/100 g',  null,             true),
('f0000000-0000-4000-8000-000000000003', 'Exceso de azúcares',         '10% de energía',  null,             true),
('f0000000-0000-4000-8000-000000000003', 'Exceso de grasas saturadas', '10% de energía',  '5.0% en',        true),
('f0000000-0000-4000-8000-000000000003', 'Exceso de grasas trans',     '1% de energía',   null,             true),
('f0000000-0000-4000-8000-000000000003', 'Exceso de sodio',            '1.0 mg/kcal',     '0.75 mg/kcal',   true);

-- Variante Cajeta
insert into recipe_nom051_seals (recipe_id, seal_name, threshold, actual_value, passes) values
('f0000000-0000-4000-8000-000000000004', 'Exceso de calorías',         '275 kcal/100 g',  null,             true),
('f0000000-0000-4000-8000-000000000004', 'Exceso de azúcares',         '10% de energía',  null,             true),
('f0000000-0000-4000-8000-000000000004', 'Exceso de grasas saturadas', '10% de energía',  '3.6% en',        true),
('f0000000-0000-4000-8000-000000000004', 'Exceso de grasas trans',     '1% de energía',   null,             true),
('f0000000-0000-4000-8000-000000000004', 'Exceso de sodio',            '1.0 mg/kcal',     '0.80 mg/kcal',   true);

-- Variante Plátano ("al filo" en azúcar)
insert into recipe_nom051_seals (recipe_id, seal_name, threshold, actual_value, passes) values
('f0000000-0000-4000-8000-000000000005', 'Exceso de calorías',         '275 kcal/100 g',  null,                             true),
('f0000000-0000-4000-8000-000000000005', 'Exceso de azúcares',         '10% de energía',  '8.2% en (azúcar libre, al filo)', true),
('f0000000-0000-4000-8000-000000000005', 'Exceso de grasas saturadas', '10% de energía',  null,                             true),
('f0000000-0000-4000-8000-000000000005', 'Exceso de grasas trans',     '1% de energía',   null,                             true),
('f0000000-0000-4000-8000-000000000005', 'Exceso de sodio',            '1.0 mg/kcal',     '0.71 mg/kcal',                   true);

-- ----------------------------------------------------------------------------
-- Reglas de formulación globales
-- ----------------------------------------------------------------------------
insert into formulation_rules (sort_order, rule, rationale) values
(1, 'Leche descremada, nunca entera ni crema', 'Si no, vuelve el sello de grasas saturadas.'),
(2, 'Cero sal añadida', 'El sodio es el límite más frágil; el Isopure aporta ~160 mg de sodio por scoop y es la restricción estructural de toda la fórmula.'),
(3, 'El aceite alto oleico NO es opcional', 'Sus calorías mantienen el ratio sodio/kcal por debajo de 1.0. Sin aceite, truena el sello de sodio.'),
(4, 'Cacao siempre natural, nunca alcalinizado', 'Sodio: el cacao alcalinizado (Dutch process) lleva carbonatos de sodio.'),
(5, 'Cero cajeta real en el sabor cajeta', 'Azúcares: la cajeta es azúcar caramelizada pura y dispara el sello con un par de cucharadas.'),
(6, 'Plátano máx 60-70 g por pinta', 'Azúcar libre: a 80 g llega justo a 10% = sello.');
