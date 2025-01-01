import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type Customer = {
  id: number;
  name: string;
  vat_number: string;
  email: string;
  address: string;
  phone: string;
  tag: string;
};

export type CreateCustomerDTO = {
  name: string;
  vat_number: string;
  email: string;
  address: string;
  phone: string;
  tag: string;
};

const CUSTOMERS_QUERY_KEY = "customers";

export function useCustomers() {
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY],
    queryFn: async () => {
      const response = await fetch(`${urlPy}/api/customers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useMutation({
    mutationFn: async (data: CreateCustomerDTO) => {
      const response = await fetch(`${urlPy}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create customer");
      }
      return response.json() as Promise<Customer>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
    },
  });
}
