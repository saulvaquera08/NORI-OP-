export type NavIconName =
  | "dashboard"
  | "formulador"
  | "nutrimental"
  | "recetario"
  | "inventario"
  | "produccion"
  | "ventas"
  | "noriai";

export function NavIcon({ name }: { name: NavIconName }) {
  switch (name) {
    case "dashboard":
      return (
        <div className="grid w-3 grid-cols-2 grid-rows-2 gap-[2px]">
          <span className="rounded-[1px]" style={{ background: "currentColor" }} />
          <span className="rounded-[1px] opacity-50" style={{ background: "currentColor" }} />
          <span className="rounded-[1px] opacity-50" style={{ background: "currentColor" }} />
          <span className="rounded-[1px]" style={{ background: "currentColor" }} />
        </div>
      );
    case "formulador":
      return (
        <div className="relative h-[14px] w-[14px]">
          <span
            className="absolute left-0 top-[2px] h-[9px] w-[9px] rounded-full"
            style={{ border: "1.6px solid currentColor" }}
          />
          <span
            className="absolute right-0 top-0 h-[9px] w-[9px] rounded-full opacity-55"
            style={{ border: "1.6px solid currentColor" }}
          />
        </div>
      );
    case "nutrimental":
      return (
        <div className="flex w-[13px] flex-col gap-[2.5px]">
          <span className="h-[2px] rounded-[1px]" style={{ background: "currentColor" }} />
          <span className="h-[2px] w-[70%] rounded-[1px]" style={{ background: "currentColor" }} />
          <span className="h-[2px] w-[85%] rounded-[1px]" style={{ background: "currentColor" }} />
        </div>
      );
    case "recetario":
      return (
        <div
          className="relative flex h-[14px] w-[12px] flex-col justify-center gap-[2px] rounded-[2px] px-[2px]"
          style={{ border: "1.6px solid currentColor" }}
        >
          <span className="h-[1.4px] w-full rounded-[1px] opacity-80" style={{ background: "currentColor" }} />
          <span className="h-[1.4px] w-[70%] rounded-[1px] opacity-60" style={{ background: "currentColor" }} />
        </div>
      );
    case "inventario":
      return (
        <div
          className="relative h-[13px] w-[13px] rounded-[3px]"
          style={{ border: "1.6px solid currentColor" }}
        >
          <span
            className="absolute left-[1px] right-[1px] top-[4.5px] h-[1.4px] opacity-60"
            style={{ background: "currentColor" }}
          />
        </div>
      );
    case "produccion":
      return (
        <div
          className="h-[13px] w-[13px] rounded-full"
          style={{
            border: "1.6px solid currentColor",
            borderRightColor: "transparent",
            transform: "rotate(45deg)",
          }}
        />
      );
    case "ventas":
      return (
        <div className="flex h-[13px] items-end gap-[2px]">
          <span className="w-[3px] rounded-[1px] opacity-55" style={{ height: 5, background: "currentColor" }} />
          <span className="w-[3px] rounded-[1px] opacity-80" style={{ height: 9, background: "currentColor" }} />
          <span className="w-[3px] rounded-[1px]" style={{ height: 13, background: "currentColor" }} />
        </div>
      );
    case "noriai":
      return (
        <div
          className="h-[13px] w-[13px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #E8C39B, #C9834F 60%, #5C3A22)",
          }}
        />
      );
  }
}
