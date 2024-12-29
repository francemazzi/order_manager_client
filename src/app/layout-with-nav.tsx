"use client";

import { Header } from "@/components/ui/header";
import { Sidebar } from "@/components/ui/sidebar";

interface LayoutWithNavProps {
  children: React.ReactNode;
}

export function LayoutWithNav({ children }: LayoutWithNavProps) {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 ml-16 overflow-y-auto">
          <div className="max-w-7xl px-4 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
