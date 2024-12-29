"use client";

import { Header } from "@/components/ui/header";
import { Sidebar } from "@/components/ui/sidebar";

interface LayoutWithNavProps {
  children: React.ReactNode;
}

export function LayoutWithNav({ children }: LayoutWithNavProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <main className="ml-16 max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
