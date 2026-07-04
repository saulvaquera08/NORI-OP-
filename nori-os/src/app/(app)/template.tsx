"use client";

// Se re-monta en cada navegación → anima la entrada de cada pantalla.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="nori-fade-up h-full">{children}</div>;
}
