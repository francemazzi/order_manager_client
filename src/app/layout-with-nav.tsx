"use client";

import { Header } from "@/components/ui/header";
import { Sidebar } from "@/components/ui/sidebar";

interface LayoutWithNavProps {
  children: React.ReactNode;
}

export function LayoutWithNav({ children }: LayoutWithNavProps) {
  return (
    <div className="h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <div className="flex h-full pt-16">
        <div className="fixed left-0 top-16 bottom-0 z-40">
          <Sidebar />
        </div>

        <main className="flex-1 ml-16 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
