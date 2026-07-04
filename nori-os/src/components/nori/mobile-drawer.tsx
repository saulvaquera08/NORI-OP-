"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { NavIcon } from "@/components/nori/nav-icon";
import { NAV_ITEMS } from "@/components/nori/nav-items";
import { createClient } from "@/lib/supabase/client";

// Burger + drawer deslizante para móvil (oculto en md+).
export function MobileDrawer({ userEmail }: { userEmail?: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // cerrar al navegar (patrón render-time para evitar cascada de renders)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  // bloquear scroll del fondo con el drawer abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function signOut() {
    startTransition(async () => {
      await createClient().auth.signOut();
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <div className="md:hidden">
      {/* Botón burger animado */}
      <button
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((o) => !o)}
        className="relative z-[60] flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-nori-card"
      >
        <span
          className="absolute h-[1.8px] w-[18px] rounded-full bg-nori-text transition-all duration-300"
          style={{ transform: open ? "rotate(45deg)" : "translateY(-3.5px)" }}
        />
        <span
          className="absolute h-[1.8px] w-[18px] rounded-full bg-nori-text transition-all duration-300"
          style={{ transform: open ? "rotate(-45deg)" : "translateY(3.5px)" }}
        />
      </button>

      {/* Backdrop + panel via portal: el topbar usa backdrop-filter, que
          convertiría al botón en containing block y atraparía los fixed. */}
      {open && typeof document !== "undefined" && createPortal(
        <>
          <div
            className="nori-fade-in fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            className="nori-slide-in-right fixed inset-y-0 right-0 z-50 flex w-[290px] flex-col border-l border-nori-border bg-nori-sidebar shadow-2xl shadow-black/60"
          style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center gap-[10px] px-5 pb-5 pt-6">
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-white/[0.12] bg-[#0E1116]">
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
              <span className="text-[15px] font-bold tracking-[2px]">
                NORI<span className="font-normal text-nori-text-muted"> OS</span>
              </span>
              <span className="text-[9px] tracking-[1.5px] text-nori-text-dim">SISTEMA OPERATIVO</span>
            </div>
          </div>

          <nav className="nori-stagger flex flex-col gap-1 px-3">
            {NAV_ITEMS.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-[14px] rounded-xl px-4 py-[13px] text-[15px] transition-colors",
                    active ? "bg-nori-terracota/[0.12] text-nori-terracota" : "text-nori-text-muted"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-nori-terracota" />
                  )}
                  <NavIcon name={item.icon} />
                  <span className={active ? "font-semibold" : ""}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-nori-border px-5 py-4">
            {userEmail ? (
              <div className="mb-2 truncate text-[12px] text-nori-text-muted">{userEmail}</div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] tracking-[0.5px] text-nori-text-dim">Uso interno · NORI</span>
              <button
                onClick={signOut}
                disabled={isPending}
                className="rounded-lg border border-nori-red/25 bg-nori-red/[0.08] px-3 py-[6px] text-[12px] text-nori-red disabled:opacity-50"
              >
                Salir
              </button>
            </div>
          </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
