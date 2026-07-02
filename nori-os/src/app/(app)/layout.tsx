import { Sidebar } from "@/components/nori/sidebar";
import { Topbar } from "@/components/nori/topbar";
import { SetupRequired } from "@/components/nori/setup-required";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  return (
    <div id="nori-app-shell" className="flex h-screen w-full overflow-hidden bg-nori-bg text-nori-text">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
