"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavIcon, type NavIconName } from "@/components/nori/nav-icon";

const NAV_ITEMS: { href: string; label: string; icon: NavIconName }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/formulador", label: "Formulador", icon: "formulador" },
  { href: "/nutrimental", label: "Nutrimental", icon: "nutrimental" },
  { href: "/recetario", label: "Recetario", icon: "recetario" },
  { href: "/inventario", label: "Inventario", icon: "inventario" },
  { href: "/produccion", label: "Producción", icon: "produccion" },
  { href: "/ventas", label: "Ventas", icon: "ventas" },
  { href: "/nori-ai", label: "NORI AI", icon: "noriai" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      id="nori-sidebar"
      className="flex w-[236px] flex-none flex-col border-r border-nori-border bg-nori-sidebar p-3"
    >
      <div className="flex items-center gap-[10px] px-2 pb-[22px] pt-[6px]">
        <div className="flex h-7 w-7 flex-none items-center justify-center rounded-[7px] border border-white/[0.12] bg-[#0E1116]">
          <div
            className="h-0 w-0"
            style={{
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderBottom: "9px solid #EDEAE4",
            }}
          />
        </div>
        <div className="flex flex-col leading-[1.05]">
          <span className="text-[14.5px] font-bold tracking-[2px]">
            NORI<span className="font-normal text-nori-text-muted"> OS</span>
          </span>
          <span className="text-[9px] tracking-[1.5px] text-nori-text-dim">
            SISTEMA OPERATIVO
          </span>
        </div>
      </div>

      <nav className="flex flex-col gap-[2px]">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-nav={item.href}
              className={cn(
                "mb-[1px] flex items-center gap-[11px] rounded-lg px-[10px] py-[9px] text-[13px] transition-colors",
                active
                  ? "bg-white/[0.06] text-nori-text"
                  : "text-nori-text-muted hover:bg-white/[0.04] hover:text-nori-text"
              )}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 py-[9px] text-[10.5px] tracking-[0.5px] text-nori-text-dim">
        Uso interno · NORI
      </div>
    </div>
  );
}
