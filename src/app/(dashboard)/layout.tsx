import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Bell } from "lucide-react";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-navy-950">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="h-12 flex items-center justify-end px-4 gap-3 border-b border-navy-800 bg-navy-900/50 backdrop-blur-sm">
            <Link href="/dashboard/notificari"
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors">
              <Bell className="h-4 w-4" />
            </Link>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="wave-bg min-h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
