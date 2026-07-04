"use client";

import { usePathname } from "next/navigation";
import { MobileDrawer } from "@/components/nori/mobile-drawer";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/formulador": "Formulador",
  "/nutrimental": "Tabla Nutrimental",
  "/recetario": "Recetario",
  "/inventario": "Inventario",
  "/produccion": "Producción",
  "/ventas": "Ventas",
};

export function Topbar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();
  const title = pathname ? TITLES[pathname] ?? "" : "";

  return (
    <div
      id="nori-topbar"
      className="flex h-14 flex-none items-center justify-between border-b border-nori-border bg-nori-bg/80 px-4 backdrop-blur-md md:px-7"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-[7px] border border-white/[0.12] bg-[#0E1116] md:hidden">
          <div
            className="h-0 w-0"
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderBottom: "8px solid #EDEAE4",
            }}
          />
        </div>
        <div className="text-[15px] font-semibold tracking-[-0.2px]">{title}</div>
      </div>
      <MobileDrawer userEmail={userEmail} />
    </div>
  );
}
