"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("ADMIN" | "STAFF" | "CUSTOMER")[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        router.push("/auth/login");
        return;
      }

      try {
        const user = JSON.parse(userStr);
        const role = user.role;

        if (!allowedRoles.includes(role)) {
          // Redirect to the appropriate dashboard if they have the wrong role
          if (role === "ADMIN") router.push("/dashboard/admin");
          else if (role === "STAFF") router.push("/dashboard/staff");
          else if (role === "CUSTOMER") router.push("/dashboard/investor");
          else router.push("/");
          return;
        }

        setIsAuthorized(true);
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [allowedRoles, router, pathname]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-emerald-1000 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
        <p className="text-gray-400 font-heading tracking-widest text-sm animate-pulse">VERIFYING PERMISSIONS...</p>
      </div>
    );
  }

  return <>{children}</>;
}


