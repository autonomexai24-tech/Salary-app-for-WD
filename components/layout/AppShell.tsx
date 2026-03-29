"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

function InnerShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // On the login page (/) or while loading, don't show sidebar
  const isLoginPage = pathname === "/";
  const showSidebar = !isLoginPage && !isLoading && !!user;

  return (
    <>
      {showSidebar && <Sidebar />}
      {children}
    </>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <InnerShell>{children}</InnerShell>
    </AuthProvider>
  );
}
