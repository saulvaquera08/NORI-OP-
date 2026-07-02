"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendChatMessage } from "@/lib/nori/actions";

type Message = { id: string; role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "¿Cuál receta tiene mayor margen?",
  "¿Qué ingrediente subió de precio?",
  "Optimiza esta receta",
  "Genera receta de vainilla",
];

export function ChatPanel({
  conversationId,
  initialMessages,
}: {
  conversationId: string | null;
  initialMessages: Message[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { id: `local-${Date.now()}`, role: "user", content: trimmed }]);
    setInput("");
    startTransition(async () => {
      const result = await sendChatMessage(conversationId, trimmed);
      if (!conversationId && result.conversationId) {
        router.push(`/nori-ai?c=${result.conversationId}`);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto px-8 py-6" style={{ maxWidth: 760 }}>
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className="h-[26px] w-[26px] flex-none rounded-full"
              style={
                m.role === "user"
                  ? { background: "#39332B" }
                  : { background: "radial-gradient(circle at 35% 30%, #E8C39B, #C9834F 60%, #5C3A22)" }
              }
            />
            <div className="whitespace-pre-line text-[13.5px] leading-relaxed text-nori-text-chat">
              {m.content}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-[13px] text-nori-text-dim">
            Pregúntale algo a NORI AI sobre tu operación — costos, márgenes, inventario o recetas.
          </div>
        )}
      </div>
      <div className="px-8 pb-6 pt-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp}
              onClick={() => submit(qp)}
              className="cursor-pointer rounded-full border border-white/[0.09] bg-nori-card px-[13px] py-[7px] text-xs text-nori-text-body"
            >
              {qp}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-[10px] rounded-xl border border-white/[0.08] bg-nori-card py-[6px] pl-4 pr-[6px]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit(input);
            }}
            placeholder="Pregúntale algo a NORI AI…"
            className="flex-1 bg-transparent py-2 text-[13.5px] text-nori-text outline-none placeholder:text-nori-text-dim"
          />
          <button
            onClick={() => submit(input)}
            disabled={isPending}
            className="rounded-lg bg-nori-terracota px-4 py-[9px] text-[12.5px] font-semibold text-nori-terracota-deep disabled:opacity-60"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
