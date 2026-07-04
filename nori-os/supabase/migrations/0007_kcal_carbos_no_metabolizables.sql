-- NORI OS — T-012: carbohidratos no metabolizables (parte de T-018)
-- La alulosa cuenta como carbohidrato en etiqueta pero aporta ~0 kcal.
-- recipe-calc restará esta fracción antes de aplicar 4 kcal/g.
-- (La glicerina se queda a 4 kcal/g: reales ~4.3, error ≤2 kcal/pinta.)

alter table ingredients
  add column non_metabolizable_carbs_g_100g numeric(6, 2) not null default 0;

update ingredients
  set non_metabolizable_carbs_g_100g = 100
  where id = 'a1000000-0000-4000-8000-000000000003'; -- Alulosa
