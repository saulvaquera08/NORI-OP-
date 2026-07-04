"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "Correo o contraseña incorrectos."
            : signInError.message
        );
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-nori-bg p-6 text-nori-text">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/[0.12] bg-[#0E1116]">
            <div
              className="h-0 w-0"
              style={{
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderBottom: "12px solid #EDEAE4",
              }}
            />
          </div>
          <div className="flex flex-col leading-[1.05]">
            <span className="text-lg font-bold tracking-[2px]">
              NORI<span className="font-normal text-nori-text-muted"> OS</span>
            </span>
            <span className="text-[10px] tracking-[1.5px] text-nori-text-dim">SISTEMA OPERATIVO</span>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-nori-border bg-nori-card p-6">
          <label className="mb-4 flex flex-col gap-[6px] text-[12px] text-nori-text-muted">
            Correo
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-white/[0.08] bg-nori-input px-3 py-3 text-[15px] text-nori-text outline-none focus:border-nori-terracota/50"
            />
          </label>
          <label className="mb-5 flex flex-col gap-[6px] text-[12px] text-nori-text-muted">
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-white/[0.08] bg-nori-input px-3 py-3 text-[15px] text-nori-text outline-none focus:border-nori-terracota/50"
            />
          </label>
          {error ? <div className="mb-4 text-[12.5px] text-nori-red">{error}</div> : null}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-nori-terracota py-3 text-[14px] font-semibold text-nori-terracota-deep disabled:opacity-60"
          >
            {isPending ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-[11px] text-nori-text-dim">
          Uso interno · las cuentas se crean desde Supabase
        </p>
      </div>
    </div>
  );
}
