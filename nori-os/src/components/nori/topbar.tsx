"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/formulador": "Formulador Inteligente",
  "/nutrimental": "Tabla Nutrimental",
  "/inventario": "Inventario",
  "/produccion": "Producción",
  "/ventas": "Ventas",
  "/nori-ai": "NORI AI",
};

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        router.push("/nori-ai");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  const title = pathname ? TITLES[pathname] ?? "" : "";

  return (
    <div
      id="nori-topbar"
      className="flex h-14 flex-none items-center justify-between border-b border-nori-border px-7"
    >
      <div className="text-[14.5px] font-semibold">{title}</div>
      <div className="flex items-center gap-[10px]">
        <button
          onClick={() => router.push("/nori-ai")}
          className="flex cursor-pointer items-center gap-[7px] rounded-lg border border-nori-terracota/25 bg-nori-terracota/[0.08] px-3 py-[6px] text-[12.5px] text-nori-terracota"
        >
          <span className="h-[6px] w-[6px] rounded-full bg-nori-terracota" />
          Preguntar a NORI AI
          <span className="font-mono text-[10.5px] text-nori-terracota-mid">⌘K</span>
        </button>
      </div>
    </div>
  );
}
