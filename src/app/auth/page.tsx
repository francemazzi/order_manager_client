"use client";

import { Button, Input, Label, useToast } from "@/components/ui";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { setAuthCookies, isAuthenticated } from "@/lib/auth";
import { useCompanies } from "@/hooks/use-companies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_URL = process.env.NEXT_PUBLIC_URL_PY;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_URL_PY must be defined");
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company_id: number | null;
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    company_id: null as number | null,
  });
  const { toast } = useToast();
  const { data: companies } = useCompanies();

  useEffect(() => {
    const checkAuth = () => {
      console.log("Checking authentication in auth page...");
      const authenticated = isAuthenticated();
      console.log("Is authenticated:", authenticated);

      if (authenticated) {
        console.log("User is authenticated, redirecting to dashboard...");
        window.location.replace("/dashboard");
      }
    };

    checkAuth();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      console.log("Login payload:", data);
      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        });

        const responseData = await response.json();
        console.log("Login response:", responseData);

        if (!response.ok) {
          throw new Error(responseData.detail || "Login failed");
        }

        return responseData;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Setting cookies with:", data);
      setAuthCookies(data.access_token);
      toast({
        title: "Login effettuato con successo",
        description: "Benvenuto!",
      });
      console.log("Cookies set, redirecting to dashboard...");

      window.location.replace("/dashboard");
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Errore",
        description: error.message || "Credenziali non valide",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();
        console.log("Register response:", responseData);

        if (!response.ok) {
          throw new Error(responseData.detail || "Registration failed");
        }

        return responseData;
      } catch (error) {
        console.error("Register error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Registrazione effettuata con successo",
        description: "Ora puoi effettuare il login",
      });
      setIsLogin(true);
      setFormData({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        company_id: null as number | null,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message || "Registrazione fallita",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({
        email: formData.email,
        password: formData.password,
      });
    } else {
      registerMutation.mutate(formData);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">
            {isLogin ? "Accedi" : "Registrati"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <Label htmlFor="first_name">Nome</Label>
                <Input
                  id="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Cognome</Label>
                <Input
                  id="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Azienda</Label>
                <Select
                  value={
                    formData.company_id ? String(formData.company_id) : "null"
                  }
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      company_id: value === "null" ? null : Number(value),
                    })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona la tua azienda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Sono di Order Manager</SelectItem>
                    {companies?.map((company) => (
                      <SelectItem key={company.id} value={String(company.id)}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" className="w-full">
            {isLogin ? "Accedi" : "Registrati"}
          </Button>
        </form>

        <div className="text-center mt-4">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm"
          >
            {isLogin
              ? "Non hai un account? Registrati"
              : "Hai già un account? Accedi"}
          </Button>
        </div>
      </div>
    </main>
  );
}
