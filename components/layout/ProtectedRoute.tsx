"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("EMPLOYER" | "ADMIN")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Not logged in → go to login
    if (!user) {
      router.replace("/");
      return;
    }

    // Logged in but wrong role → go to employee (a safe default page)
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.replace("/employee");
    }
  }, [isLoading, user, role, allowedRoles, router]);

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          marginLeft: 240,
          color: "#6b7280",
          fontSize: 14,
        }}
      >
        Loading…
      </div>
    );
  }

  // Not authenticated
  if (!user) return null;

  // Wrong role
  if (allowedRoles && role && !allowedRoles.includes(role)) return null;

  return <>{children}</>;
}
