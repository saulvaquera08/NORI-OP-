import { redirect } from "next/navigation";
import { Sidebar } from "@/components/nori/sidebar";
import { Topbar } from "@/components/nori/topbar";
import { SetupRequired } from "@/components/nori/setup-required";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div id="nori-app-shell" className="flex h-screen w-full overflow-hidden bg-nori-bg text-nori-text">
      <Sidebar userEmail={user.email} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar userEmail={user.email} />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
