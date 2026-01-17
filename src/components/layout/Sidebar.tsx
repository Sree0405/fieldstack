import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  Users,
  Shield,
  FileText,
  Settings,
  Layers,
  Zap,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Bell,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState ,useEffect} from "react";

const navSections = [
  {
    title: "Core",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/content", icon: Layers, label: "Content" },
      { to: "/collection-builder", icon: Zap, label: "Collection Builder" },
    ],
  },
  {
    title: "Data",
    items: [
      { to: "/collections", icon: Database, label: "Collections" },
      { to: "/api-explorer", icon: Cpu, label: "API Explorer" },
    ],
  },
  {
    title: "Management",
    items: [
      { to: "/users", icon: Users, label: "Users" },
      { to: "/roles", icon: Shield, label: "Roles & Permissions" },
      { to: "/media", icon: FileText, label: "Media Library" },
    ],
  },
  {
    title: "System",
    items: [
      { to: "/notifications", icon: Bell, label: "Notifications" },
      { to: "/profile", icon: User, label: "Profile" },
      { to: "/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export const Sidebar = () => {
const [collapsed, setCollapsed] = useState(true);

useEffect(() => {
  setCollapsed(window.innerWidth < 768);
}, []);

  return (
<aside
  className={cn(
    "relative flex bg-background flex-col transition-all duration-300 sidebar-bg",
    collapsed ? "w-20" : "w-72"
  )}
  style={{
    borderRight: "1px solid rgba(255,255,255,0.08)",
  }}
>

      {/* Header */}
      <div className="relative flex h-16 items-center px-6 border-b border-white/5">
        {!collapsed && (
          <span className="text-lg font-semibold tracking-wide text-[#E6E8F2]">
            NovaCMS
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-5 h-7 w-7 rounded-full 
          text-white shadow-lg hover:brightness-110 transition"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-4 py-6 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-2 px-2 text-[11px] uppercase tracking-wider text-[#9AA0C3]">
                {section.title}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                      isActive
  ? "bg-white/5 text-[#EDEAFF] shadow-[inset_0_0_0_1px_rgba(124,92,255,0.25)]"
  : "text-[#A6A3C8] hover:bg-white/5 hover:text-[#EDEAFF]"

                    )
                  }
                >
                  {/* Active Indicator */}
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r",
                      "bg-[#7C5CFF] opacity-0 group-[.active]:opacity-100"
                    )}
                    style={{
                      boxShadow:
                        "0 0 12px rgba(124,92,255,0.35)",
                    }}
                  />

                  <item.icon className="h-5 w-5 shrink-0" />

                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 px-6 py-4 text-xs text-[#9AA0C3]">
        {!collapsed && "Enterprise Edition"}
      </div>
    </aside>
  );
};
