export function EmptyState({
  title,
  description,
  hint,
}: {
  title: string;
  description: string;
  hint?: string;
}) {
  return (
    <div className="flex h-full min-h-[320px] w-full items-center justify-center p-8">
      <div className="max-w-md rounded-[14px] border border-nori-border bg-nori-card p-7 text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-nori-terracota/10">
          <span className="h-2 w-2 rounded-full bg-nori-terracota" />
        </div>
        <h2 className="mb-2 text-[15px] font-semibold text-nori-text">{title}</h2>
        <p className="text-[13px] leading-relaxed text-nori-text-body">{description}</p>
        {hint ? <p className="mt-3 text-[12px] text-nori-text-dim">{hint}</p> : null}
      </div>
    </div>
  );
}
