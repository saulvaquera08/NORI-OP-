export function SetupRequired() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-nori-bg p-8 text-nori-text">
      <div className="max-w-lg rounded-2xl border border-nori-border bg-nori-card p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-[#0E1116]">
            <div
              className="h-0 w-0"
              style={{
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderBottom: "9px solid #EDEAE4",
              }}
            />
          </div>
          <span className="text-[15px] font-bold tracking-[2px]">
            NORI<span className="font-normal text-nori-text-muted"> OS</span>
          </span>
        </div>
        <h1 className="mb-2 text-lg font-semibold">Falta conectar Supabase</h1>
        <p className="mb-4 text-[13.5px] leading-relaxed text-nori-text-body">
          NORI OS necesita un proyecto de Supabase para guardar ingredientes, recetas,
          inventario, producción y ventas.
        </p>
        <ol className="mb-4 list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-nori-text-body">
          <li>
            Crea un proyecto en{" "}
            <span className="text-nori-terracota">supabase.com</span>.
          </li>
          <li>
            Ejecuta las migraciones en <code className="text-nori-text">supabase/migrations/</code>{" "}
            (schema + datos de ejemplo) con el CLI de Supabase o pegándolas en el SQL editor,
            en orden.
          </li>
          <li>
            Copia <code className="text-nori-text">.env.local.example</code> a{" "}
            <code className="text-nori-text">.env.local</code> y agrega la URL y anon key
            de tu proyecto.
          </li>
          <li>Reinicia el servidor de desarrollo.</li>
        </ol>
        <p className="text-[12px] text-nori-text-dim">
          Ver README.md del proyecto para más detalle.
        </p>
      </div>
    </div>
  );
}
