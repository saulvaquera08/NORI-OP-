# Contexto de negocio — NORI

## La empresa
NORI desarrolla, fabrica y vende **helados (nieve) altos en proteína** en México. NORI OS es su sistema operativo interno: el centro de operaciones de toda la empresa, no solo un inventario.

## Producto físico
- Presentación por pinta (~475 ml) / vaso (240 ml).
- Lineup core: **Vainilla, Chocolate, Cajeta, Cookies & Cream**. Plátano es edición especial/estacional.
- Formulación basada en una **base común V6 Simple** + deltas por sabor.
- Dos máquinas: **Ninja Creami** (actual, la base lleva glicerina) y **Whynter ICM-200LS** (futura, sin glicerina).
- Objetivo regulatorio: **cero sellos NOM-051** en todos los sabores.
- La restricción estructural de la fórmula es el **sodio del Isopure** (~160 mg/scoop); el aceite alto oleico existe para mantener el ratio sodio/kcal < 1.0.

## Restricciones duras del negocio
1. Los macros actuales son **estimados**, NO análisis de laboratorio. El bromatológico es obligatorio antes de empaque comercial (`is_lab_verified = false` hasta entonces).
2. Las 6 reglas de formulación (tabla `formulation_rules`) no son negociables sin decisión del fundador.
3. Nunca borrar recetas: el versionado es histórico e inmutable.

## Usuario del sistema
Hoy: el fundador (Saúl). Futuro: administrador, producción, compras, ventas, contador, supervisor — con permisos por rol (aún no implementado).

## Visión
Experiencia tipo Linear/Notion/Stripe/Vercel: minimalista, rápida, dark-first. A largo plazo, SaaS vendible a otras marcas de alimentos funcionales.

## Economía unitaria (datos del fundador, 2026-07-04)
- COGS por pinta: ingredientes ~$54-58 + packaging → **~$70-78 bajo volumen / ~$63-68 a 500+ pzas**.
- Precios: **wholesale $130/pinta** (margen contribución ~$55-60, ~43%) · retail directo $149-169 (~55-60%).
- **Isopure = ~40% del COGS.** Palanca #1: WPI a granel 25 kg importado ($600-800/kg vs $1,130 actual) → ahorro ~$8-12/pinta. Ejecutar SOLO tras validar recompra. Palanca #2: alulosa a granel 25 kg (~$150-180/kg vs $250) — pedir cotización a Granel Vital/Pochteca ya.
- **Capacidad = Ninja Creami:** 1 ciclo/pinta + congelado 24 h → 15-25 pintas/semana, techo ~100/mes. Metas arriba de eso requieren la Whynter (fase Mes 5-6).
