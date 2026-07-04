"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavIcon } from "@/components/nori/nav-icon";
import { NAV_ITEMS } from "@/components/nori/nav-items";

// Barra de navegación inferior estilo iOS — solo visible bajo md.
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-7 border-t border-nori-border bg-nori-sidebar/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-[52px] flex-col items-center justify-center gap-1 py-[6px]",
              active ? "text-nori-terracota" : "text-nori-text-dim"
            )}
          >
            <NavIcon name={item.icon} />
            <span className="text-[9px] leading-none">{item.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
