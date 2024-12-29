"use client";

import { Button } from "./button";
import { clearAuthCookies } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    clearAuthCookies();
    router.replace("/auth");
  };

  return (
    <header className="w-full h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="h-full px-2 mx-auto flex items-center">
        <div className="flex-1">
          <Button
            variant="link"
            className="text-xl font-bold dark:text-white"
            onClick={() => router.push("/dashboard")}
          >
            Order Manager
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="flex items-center gap-2 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
