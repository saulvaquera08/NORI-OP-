"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="cursor-pointer rounded-[9px] bg-nori-terracota px-4 py-[9px] text-[12.5px] font-semibold text-nori-terracota-deep"
    >
      Imprimir
    </button>
  );
}
