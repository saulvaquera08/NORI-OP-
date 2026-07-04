"use client";

import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/formulador": "Formulador",
  "/nutrimental": "Tabla Nutrimental",
  "/recetario": "Recetario",
  "/inventario": "Inventario",
  "/produccion": "Producción",
  "/ventas": "Ventas",
};

export function Topbar() {
  const pathname = usePathname();
  const title = pathname ? TITLES[pathname] ?? "" : "";

  return (
    <div
      id="nori-topbar"
      className="flex h-14 flex-none items-center justify-between border-b border-nori-border px-7"
    >
      <div className="text-[14.5px] font-semibold">{title}</div>
    </div>
  );
}
