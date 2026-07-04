"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { NavIcon } from "@/components/nori/nav-icon";
import { NAV_ITEMS } from "@/components/nori/nav-items";
import { createClient } from "@/lib/supabase/client";

export function Sidebar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      await createClient().auth.signOut();
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <div
      id="nori-sidebar"
      className="hidden w-[236px] flex-none flex-col border-r border-nori-border bg-nori-sidebar p-3 md:flex"
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
                "relative mb-[1px] flex items-center gap-[11px] rounded-lg px-[10px] py-[9px] text-[13px] transition-all duration-200",
                active
                  ? "bg-white/[0.06] text-nori-text"
                  : "text-nori-text-muted hover:translate-x-[2px] hover:bg-white/[0.04] hover:text-nori-text"
              )}
            >
              {active && (
                <span className="absolute -left-3 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r-full bg-nori-terracota" />
              )}
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 px-2 py-[9px]">
        {userEmail ? (
          <span className="truncate text-[11px] text-nori-text-muted" title={userEmail}>
            {userEmail}
          </span>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10.5px] tracking-[0.5px] text-nori-text-dim">Uso interno · NORI</span>
          {userEmail ? (
            <button
              onClick={signOut}
              disabled={isPending}
              className="text-[11px] text-nori-text-dim underline-offset-2 hover:text-nori-terracota hover:underline disabled:opacity-50"
            >
              Salir
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
