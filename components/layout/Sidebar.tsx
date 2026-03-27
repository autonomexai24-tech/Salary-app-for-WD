"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, IndianRupee } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Employee", href: "/employee", icon: <Users size={20} /> },
  { label: "Department", href: "/department", icon: <Building2 size={20} /> },
  { label: "Salary", href: "/salary", icon: <IndianRupee size={20} /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-60 flex flex-col z-50"
      style={{ backgroundColor: "var(--sidebar-bg)" }}
    >
      {/* Brand */}
      <div className="flex items-center px-6 py-5 border-b border-white/10">
        <p className="text-white font-semibold text-base tracking-tight">Salary App</p>
      </div>

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
    </aside>
  );
}
