import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChatPanel } from "@/app/(app)/nori-ai/chat-panel";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupRequired } from "@/components/nori/setup-required";

export const dynamic = "force-dynamic";

export default async function NoriAiPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; new?: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const { c, new: isNew } = await searchParams;
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("chat_conversations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const selectedId = isNew ? null : c ?? conversations?.[0]?.id ?? null;

  const { data: messages } = selectedId
    ? await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: true })
    : { data: [] };

  return (
    <div className="flex h-full">
      <div className="w-[270px] flex-none overflow-y-auto border-r border-nori-border p-[14px] pt-[18px]">
        <Link
          href="/nori-ai?new=1"
          className="mb-4 block cursor-pointer rounded-[9px] border border-nori-terracota/25 bg-nori-terracota/10 py-[9px] text-center text-[12.5px] text-nori-terracota"
        >
          + Nueva conversación
        </Link>
        <div className="mb-[10px] text-[11px] uppercase tracking-[0.5px] text-nori-text-dim">Historial</div>
        {(conversations ?? []).map((h) => (
          <Link
            key={h.id}
            href={`/nori-ai?c=${h.id}`}
            className="mb-[2px] block rounded-lg px-[10px] py-[10px] text-[12.5px]"
            style={{
              color: h.id === selectedId ? "#EDEAE4" : "#9C978F",
              background: h.id === selectedId ? "rgba(255,255,255,0.05)" : "transparent",
            }}
          >
            {h.title}
          </Link>
        ))}
      </div>

      <ChatPanel
        key={selectedId ?? "new"}
        conversationId={selectedId}
        initialMessages={(messages ?? []).map((m) => ({ id: m.id, role: m.role, content: m.content }))}
      />
    </div>
  );
}
