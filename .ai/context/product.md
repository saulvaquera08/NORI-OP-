# Producto — NORI OS

## Origen del diseño
El diseño canónico vive en `project/NORI OS - Producto.dc.html` (export de Claude Design) + transcript en `chats/chat1.md`. Identidad: fondo carbón `#15181C`, tarjetas `#1B1F25`, acento terracota/cajeta `#C9834F`, azul glaciar `#8FA8BC`, ámbar `#D9A15C`, rojo `#C1584A`. Tipografía Instrument Sans + JetBrains Mono. Dark-first.

## Pantallas implementadas (7)
1. **Dashboard** — KPIs del mes (ventas, utilidad, producción hoy, inventario crítico), gráfica ventas vs. producción 14 días, top productos, alertas, actividad reciente. Todo agregado desde Supabase.
2. **Formulador** — catálogo de ingredientes a la izquierda, receta editable al centro (gramos → recálculo en vivo), panel "En vivo" (costo lote/litro/vaso, nutrición por vaso, margen). Persiste vía Server Actions.
3. **Nutrimental** — etiqueta blanca estilo NOM-051 (por 100 g / por vaso), validación de sellos, comparador de versiones, imprimir.
4. **Inventario** — tarjetas de stock con filtros (todos/bajo/suficiente), movimientos recientes.
5. **Producción** — lista de órdenes + detalle (temperatura, rendimiento, merma, operador, fotos, observaciones) + formulario de nueva orden (RPC descuenta inventario).
6. **Ventas** — KPIs, ingresos por canal, métodos de pago, pedidos recientes.
7. ~~NORI AI~~ — ELIMINADO (T-014). Decisión del fundador: la app es una herramienta de control operativo, sin IA.

## Módulos del spec original AÚN NO implementados
Ingredientes (CRUD del catálogo), Compras, Finanzas, CRM, Documentos, Configuración, permisos por usuario. El prototipo aprobado cubría solo las 7 pantallas de arriba.

## Recetario de marca (en DB, sin UI todavía)
Las 5 recetas NORI (Base V6 Creami/Whynter + Chocolate/Cajeta/Plátano) viven en Supabase con ingredientes declarados, proceso, nutrición estimada y sellos. Ninguna pantalla las muestra aún.

## Norte del producto (fundador, 2026-07-04)
Lo más importante, en orden: (1) apuntar variaciones de recetas y que la tabla nutrimental se genere sola al ingresarlas; (2) apuntar el inventario actual; (3) apuntar las ventas; (4) registrar qué se produjo y con qué receta. Reemplazar las hojas de Excel: saber qué entró, qué salió, cómo y cuándo, todo en un solo lugar. NADA de chats de IA.

## Principios de producto
- Todo conectado: un movimiento afecta al resto del sistema.
- Nada de datos falsos en producción: mejor un estado vacío bien diseñado que números inventados.
- Los estimados nutricionales siempre se etiquetan como estimados (pendiente bromatológico).
- Español mexicano en toda la UI.
