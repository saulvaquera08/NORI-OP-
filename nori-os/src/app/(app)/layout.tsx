import { redirect } from "next/navigation";
import { Sidebar } from "@/components/nori/sidebar";
import { Topbar } from "@/components/nori/topbar";
import { MobileNav } from "@/components/nori/mobile-nav";
import { SetupRequired } from "@/components/nori/setup-required";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  // El proxy ya protege las rutas; esta verificación es el segundo candado
  // (y nos da el correo para el sidebar).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div id="nori-app-shell" className="flex h-screen w-full overflow-hidden bg-nori-bg text-nori-text">
      <Sidebar userEmail={user.email} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</div>
      </div>
      <MobileNav />
    </div>
  );
}
