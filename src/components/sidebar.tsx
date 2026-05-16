"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/roles";
import {
  LayoutDashboard,
  DoorOpen,
  Users,
  BookOpen,
  FileJson,
  CalendarCheck,
  DollarSign,
  ClipboardCheck,
  PaintBucket,
  BarChart3,
  ParkingCircle,
  Search,
  LogOut,
  ChevronLeft,
  Building2,
  CalendarDays,
  Moon,
  Upload,
  FileCheck,
  Settings as SettingsIcon,
  Bell,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} />, roles: ["*"] },
  { label: "Camere", href: "/dashboard/camere", icon: <DoorOpen size={20} />, roles: ["CONDUCERE", "ADMINISTRATIV", "RECEPTIE"] },
  { label: "Cursanți", href: "/dashboard/cursanti", icon: <Users size={20} />, roles: ["CONDUCERE", "ADMINISTRATIV", "PROGRAMARE"] },
  { label: "Cursuri", href: "/dashboard/cursuri", icon: <BookOpen size={20} />, roles: ["CONDUCERE", "PROGRAMARE"] },
  { label: "Rezervări", href: "/dashboard/rezervari", icon: <CalendarCheck size={20} />, roles: ["CONDUCERE", "ADMINISTRATIV", "RECEPTIE", "PROGRAMARE"] },
  { label: "Plăți", href: "/dashboard/plati", icon: <DollarSign size={20} />, roles: ["CONDUCERE", "CONTABILITATE"] },
  { label: "Check-In/Out", href: "/dashboard/checkinout", icon: <ClipboardCheck size={20} />, roles: ["CONDUCERE", "ADMINISTRATIV", "RECEPTIE"] },
  { label: "Housekeeping", href: "/dashboard/housekeeping", icon: <PaintBucket size={20} />, roles: ["CONDUCERE", "ADMINISTRATIV", "RECEPTIE", "CAMERISTA"] },
  { label: "Rapoarte", href: "/dashboard/rapoarte", icon: <BarChart3 size={20} />, roles: ["CONDUCERE", "CONTABILITATE"] },
  { label: "Parcare", href: "/dashboard/parcare", icon: <ParkingCircle size={20} />, roles: ["CONDUCERE", "ADMINISTRATIV"] },
  { label: "Calendar", href: "/dashboard/calendar", icon: <CalendarDays size={20} />, roles: ["CONDUCERE", "ADMINISTRATIV", "RECEPTIE"] },
  { label: "Cereri cazare", href: "/dashboard/cereri", icon: <FileCheck size={20} />, roles: ["CONDUCERE", "ADMINISTRATIV", "PROGRAMARE"] },
  { label: "Night Audit", href: "/dashboard/night-audit", icon: <Moon size={20} />, roles: ["CONDUCERE", "ADMINISTRATIV"] },
  { label: "Documentație API", href: "/dashboard/api", icon: <FileJson size={20} />, roles: ["CONDUCERE", "ADMINISTRATIV"] },
  { label: "Documente", href: "/dashboard/documente", icon: <Upload size={20} />, roles: ["PROGRAMARE", "ADMINISTRATIV"] },
  { label: "Evaluări", href: "/dashboard/evaluari", icon: <Star size={20} />, roles: ["CONDUCERE", "ADMINISTRATIV"] },
  { label: "Utilizatori", href: "/dashboard/utilizatori", icon: <Users size={20} />, roles: ["CONDUCERE"] },
  { label: "Notificări", href: "/dashboard/notificari", icon: <Bell size={20} />, roles: ["*"] },
  { label: "Setări", href: "/dashboard/setari", icon: <SettingsIcon size={20} />, roles: ["CONDUCERE", "ADMINISTRATIV"] },
  { label: "Obiecte pierdute", href: "/dashboard/obiecte-pierdute", icon: <Search size={20} />, roles: ["CONDUCERE", "ADMINISTRATIV"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const role = session?.user?.role || "";

  const filteredItems = navItems.filter(
    (item) => item.roles.includes("*") || item.roles.includes(role)
  );

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "CM";

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2 flex-1">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Campus Manager</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          if (collapsed) {
            return (
              <Tooltip key={item.href}>
              <TooltipTrigger>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors mx-auto",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {item.icon}
                </Link>
              </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger>
              <Avatar className="h-9 w-9 cursor-pointer mx-auto" onClick={() => signOut()}>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[role] || role}</p>
              <p className="text-xs text-muted-foreground">Click pentru logout</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => signOut()}>
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{ROLE_LABELS[role] || role}</p>
            </div>
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    </aside>
  );
}
