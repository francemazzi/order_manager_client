import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Company = {
  id: number;
  name: string;
  vat_number: string;
  email: string;
  address: string;
  phone: string;
  tag: string;
};

export type CreateCompanyDTO = {
  name: string;
  vat_number: string;
  email: string;
  address: string;
  phone: string;
  tag: string;
};

export type UpdateCompanyDTO = Partial<CreateCompanyDTO>;

const COMPANIES_QUERY_KEY = "companies";

export function useCompanies() {
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useQuery({
    queryKey: [COMPANIES_QUERY_KEY],
    queryFn: async () => {
      const response = await fetch(`${urlPy}/api/companies`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useMutation({
    mutationFn: async (data: CreateCompanyDTO) => {
      const response = await fetch(`${urlPy}/api/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create company");
      }
      return response.json() as Promise<Company>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANIES_QUERY_KEY] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateCompanyDTO;
    }) => {
      const response = await fetch(`${urlPy}/api/companies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update company");
      }
      return response.json() as Promise<Company>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANIES_QUERY_KEY] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${urlPy}/api/companies/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete company");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANIES_QUERY_KEY] });
    },
  });
}
