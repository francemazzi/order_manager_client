"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui";

const API_URL = process.env.NEXT_PUBLIC_URL_PY;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_URL_PY must be defined");
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { data: user, isError } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || "Failed to fetch user");
      }

      return responseData;
    },
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: "Errore",
        description: "Devi effettuare il login",
        variant: "destructive",
      });
      router.push("/auth");
    }
  }, [isError, router, toast]);

  if (!user) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Benvenuto nella Dashboard</h1>
      <p className="text-xl">
        Ciao, {user.first_name} {user.last_name}!
      </p>
    </main>
  );
}
