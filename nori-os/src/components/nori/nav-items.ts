import type { NavIconName } from "@/components/nori/nav-icon";

export const NAV_ITEMS: { href: string; label: string; shortLabel: string; icon: NavIconName }[] = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Inicio", icon: "dashboard" },
  { href: "/formulador", label: "Formulador", shortLabel: "Fórmulas", icon: "formulador" },
  { href: "/nutrimental", label: "Nutrimental", shortLabel: "Etiqueta", icon: "nutrimental" },
  { href: "/recetario", label: "Recetario", shortLabel: "Recetas", icon: "recetario" },
  { href: "/inventario", label: "Inventario", shortLabel: "Stock", icon: "inventario" },
  { href: "/produccion", label: "Producción", shortLabel: "Lotes", icon: "produccion" },
  { href: "/ventas", label: "Ventas", shortLabel: "Ventas", icon: "ventas" },
];
