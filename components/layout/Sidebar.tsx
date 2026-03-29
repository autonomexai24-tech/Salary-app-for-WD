"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, IndianRupee, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: ("EMPLOYER" | "ADMIN")[];
}

const allNavItems: NavItem[] = [
  { label: "Employee",   href: "/employee",   icon: <Users size={20} />,       roles: ["EMPLOYER", "ADMIN"] },
  { label: "Department", href: "/department",  icon: <Building2 size={20} />,   roles: ["EMPLOYER", "ADMIN"] },
  { label: "Salary",     href: "/salary",      icon: <IndianRupee size={20} />, roles: ["ADMIN"] },
  { label: "Settings",   href: "/settings",    icon: <Settings size={20} />,    roles: ["ADMIN"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  // Filter nav items based on user role
  const navItems = allNavItems.filter(
    (item) => role && item.roles.includes(role)
  );

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-60 flex flex-col z-50"
      style={{ backgroundColor: "var(--sidebar-bg)" }}
    >
      {/* Brand */}
      <div className="flex items-center px-6 py-5 border-b border-white/10">
        <p className="text-white font-semibold text-base tracking-tight">Salary App</p>
      </div>

      {/* User role badge */}
      {user && (
        <div className="px-6 py-3 border-b border-white/10">
          <p className="text-white/80 text-xs font-medium truncate">{user.name}</p>
          <span
            className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
            style={{
              backgroundColor: role === "ADMIN" ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)",
              color: role === "ADMIN" ? "#fca5a5" : "#86efac",
            }}
          >
            {role}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 px-4 rounded-lg min-h-[44px] text-sm font-medium transition-all",
                "active:scale-[0.98]",
                isActive
                  ? "text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10",
              ].join(" ")}
              style={
                isActive
                  ? { backgroundColor: "var(--sidebar-active)" }
                  : undefined
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 rounded-lg min-h-[44px] text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all w-full active:scale-[0.98] cursor-pointer"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
