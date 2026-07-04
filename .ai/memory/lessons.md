# Lecciones aprendidas

- **`.single()` de Supabase truena con 0 filas.** Usar `.maybeSingle()` o manejar el error cuando la tabla pueda estar vacía. Origen: crashes de formulador/nutrimental contra la DB real (T-001).
- **No asumir que la DB tiene los datos del seed.** El seed demo nunca se aplicó a producción (a propósito). Toda pantalla debe soportar 0 filas.
- **El conector MCP de Supabase se desconecta a veces** entre turnos. Si no responde: reintentar más tarde; las migraciones pueden dejarse listas y probadas en Postgres local mientras tanto.
- **El registry de shadcn devuelve 403 en el sandbox** — componentes UI se escriben a mano siguiendo el patrón existente.
- **El proxy de GitHub requiere que el repo esté registrado en la sesión** (add_repo) para tener permiso de escritura; 403 en push = falta acceso, no error de red.
- **`psql -c` con varios statements corre en una transacción implícita**: si uno falla, se revierte todo (nos pasó creando roles locales).
- **Next 16 tiene breaking changes** vs. conocimiento previo del framework: consultar `node_modules/next/dist/docs/` antes de usar APIs dudosas.
- **El sandbox bloquea egress HTTP a `*.supabase.co` desde procesos locales** (dev server); el MCP sí llega. Para QA de la app usar el mock PostgREST local (`scratchpad/pgrest-empty-mock.js` reproduce PGRST116/maybeSingle) o probar tras el deploy en Vercel.
- **Verificar la evidencia antes de declarar bug**: "Producción truena con 0 órdenes" resultó falso (ya había guard). El plan se corrige en la etapa Planner, no se arrastra.
