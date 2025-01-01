"use client";

import { Button } from "./button";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart,
  ShoppingCart,
  Package,
  Users,
  UserCog,
  DollarSign,
} from "lucide-react";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      path: "/dashboard",
      icon: BarChart,
      label: "Dashboard",
    },
    {
      path: "/sales",
      icon: DollarSign,
      label: "Vendite",
    },
    {
      path: "/order",
      icon: ShoppingCart,
      label: "Ordini",
    },
    {
      path: "/item",
      icon: Package,
      label: "Articoli",
    },
    {
      path: "/supplier",
      icon: Users,
      label: "Stakeholders",
    },
    {
      path: "/users",
      icon: UserCog,
      label: "Gestione Utenti",
    },
  ];

  return (
    <aside className="w-16 h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
      <div className="flex flex-col items-center py-4 space-y-4">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 relative group ${
              pathname === item.path ? "bg-gray-100 dark:bg-gray-800" : ""
            } dark:text-white`}
            onClick={() => router.push(item.path)}
          >
            <item.icon className="h-6 w-6" />
            <span className="sr-only">{item.label}</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {item.label}
            </div>
          </Button>
        ))}
      </div>
    </aside>
  );
}
