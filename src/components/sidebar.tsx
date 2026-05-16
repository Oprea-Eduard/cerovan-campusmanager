"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/roles";
import {
  LayoutDashboard, DoorOpen, Users, BookOpen, CalendarCheck,
  DollarSign, ClipboardCheck, PaintBucket, BarChart3, ParkingCircle,
  Search, LogOut, ChevronLeft, CalendarDays, Moon,
  Upload, FileCheck, Settings, Star, FileJson,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItem {
  label: string; href: string; icon: React.ReactNode; roles: string[];
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Panou", href: "/dashboard", icon: <LayoutDashboard size={18} />, roles: ["*"] },
  { label: "Camere", href: "/dashboard/camere", icon: <DoorOpen size={18} />, roles: ["CONDUCERE", "ADMINISTRATIV", "RECEPTIE"] },
  { label: "Cursanți", href: "/dashboard/cursanti", icon: <Users size={18} />, roles: ["CONDUCERE", "ADMINISTRATIV", "PROGRAMARE"] },
  { label: "Cursuri", href: "/dashboard/cursuri", icon: <BookOpen size={18} />, roles: ["CONDUCERE", "PROGRAMARE"] },
  { label: "Rezervări", href: "/dashboard/rezervari", icon: <CalendarCheck size={18} />, roles: ["CONDUCERE", "ADMINISTRATIV", "RECEPTIE", "PROGRAMARE"] },
  { label: "Plăți", href: "/dashboard/plati", icon: <DollarSign size={18} />, roles: ["CONDUCERE", "CONTABILITATE"] },
  { label: "Check-In/Out", href: "/dashboard/checkinout", icon: <ClipboardCheck size={18} />, roles: ["CONDUCERE", "ADMINISTRATIV", "RECEPTIE"] },
  { label: "Housekeeping", href: "/dashboard/housekeeping", icon: <PaintBucket size={18} />, roles: ["CONDUCERE", "ADMINISTRATIV", "RECEPTIE", "CAMERISTA"] },
  { label: "Rapoarte", href: "/dashboard/rapoarte", icon: <BarChart3 size={18} />, roles: ["CONDUCERE", "CONTABILITATE"] },
  { label: "Calendar", href: "/dashboard/calendar", icon: <CalendarDays size={18} />, roles: ["CONDUCERE", "ADMINISTRATIV", "RECEPTIE"] },
  { label: "Cereri", href: "/dashboard/cereri", icon: <FileCheck size={18} />, roles: ["CONDUCERE", "ADMINISTRATIV", "PROGRAMARE"] },
  { label: "Night Audit", href: "/dashboard/night-audit", icon: <Moon size={18} />, roles: ["CONDUCERE", "ADMINISTRATIV"] },
  { label: "Parcare", href: "/dashboard/parcare", icon: <ParkingCircle size={18} />, roles: ["CONDUCERE", "ADMINISTRATIV"] },
  { label: "Documente", href: "/dashboard/documente", icon: <Upload size={18} />, roles: ["PROGRAMARE", "ADMINISTRATIV"] },
  { label: "Evaluări", href: "/dashboard/evaluari", icon: <Star size={18} />, roles: ["CONDUCERE", "ADMINISTRATIV"] },
  { label: "Utilizatori", href: "/dashboard/utilizatori", icon: <Users size={18} />, roles: ["CONDUCERE"] },
  { label: "Setări", href: "/dashboard/setari", icon: <Settings size={18} />, roles: ["CONDUCERE", "ADMINISTRATIV"] },
  { label: "Obiecte", href: "/dashboard/obiecte-pierdute", icon: <Search size={18} />, roles: ["CONDUCERE", "ADMINISTRATIV"] },
  { label: "API", href: "/dashboard/api", icon: <FileJson size={18} />, roles: ["CONDUCERE", "ADMINISTRATIV"] },
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
    ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "CM";

  return (
    <aside
      className={cn(
        "glass-sidebar flex flex-col transition-all duration-300 z-30",
        collapsed ? "w-[60px]" : "w-56"
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center h-14 border-b border-sidebar-border px-3", collapsed && "justify-center")}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="text-lg leading-none">⚓</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-100 truncate heading-serif">Campus</p>
              <p className="text-[10px] text-stone-400 tracking-widest uppercase">Manager</p>
            </div>
          </div>
        )}
        {collapsed && <span className="text-lg">⚓</span>}
        <Button variant="ghost" size="icon" className={cn("h-7 w-7 text-stone-400 hover:text-stone-200", collapsed && "hidden")}
          onClick={() => setCollapsed(true)}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        {collapsed && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-stone-400 hover:text-stone-200 absolute -right-3 top-3 bg-navy-800 rounded-full border border-sidebar-border"
            onClick={() => setCollapsed(false)}>
            <ChevronLeft className="h-3 w-3 rotate-180" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-0.5">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return collapsed ? (
            <Tooltip key={item.href}>
              <TooltipTrigger>
                <Link href={item.href}
                  className={cn("flex items-center justify-center h-9 w-full rounded-lg transition-all duration-150 mx-auto",
                    isActive ? "bg-teal-500/15 text-teal-300" : "text-stone-400 hover:text-stone-200 hover:bg-white/[0.04]"
                  )}>
                  {item.icon}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-navy-800 border-navy-600 text-stone-100 text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-all duration-150",
                isActive
                  ? "nav-item-active font-medium"
                  : "nav-item-inactive"
              )}>
              <span className={cn("flex-shrink-0", isActive ? "text-teal-400" : "")}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-2.5">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger>
              <Avatar className="h-8 w-8 cursor-pointer mx-auto ring-1 ring-sidebar-border"
                onClick={() => signOut()}>
                <AvatarFallback className="bg-teal-500/20 text-teal-300 text-xs">{initials}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-navy-800 border-navy-600 text-stone-100">
              <p className="text-xs font-medium">{session?.user?.name}</p>
              <p className="text-[10px] text-stone-400">{ROLE_LABELS[role] || role}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => signOut()}>
            <Avatar className="h-8 w-8 ring-1 ring-sidebar-border">
              <AvatarFallback className="bg-teal-500/20 text-teal-300 text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-200 truncate">{session?.user?.name}</p>
              <p className="text-[10px] text-stone-500 truncate">{ROLE_LABELS[role] || role}</p>
            </div>
            <LogOut className="h-3.5 w-3.5 text-stone-500 group-hover:text-stone-300 transition-colors flex-shrink-0" />
          </div>
        )}
      </div>
    </aside>
  );
}
