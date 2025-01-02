import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Item = {
  id: number;
  name: string;
  description: string;
  price: number;
  price_unit: "EUR";
  sku: string;
  stock: number;
  stock_unit: "PZ";
  company_id: number;
  created_at: string;
  updated_at: string;
  gross_margin: number;
};

export interface CreateItemDTO {
  name: string;
  description: string;
  price: number;
  price_unit: "EUR";
  sku: string;
  stock: number;
  stock_unit: "PZ";
  company_id: number;
  gross_margin: number;
}

export type UpdateItemDTO = Partial<CreateItemDTO>;

const ITEMS_QUERY_KEY = "items";

export function useItems(companyId: number) {
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useQuery({
    queryKey: [ITEMS_QUERY_KEY, companyId],
    queryFn: async () => {
      const response = await fetch(
        `${urlPy}/api/items?company_id=${companyId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useMutation({
    mutationFn: async (data: CreateItemDTO) => {
      const response = await fetch(`${urlPy}/api/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create item");
      }
      return response.json() as Promise<Item>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ITEMS_QUERY_KEY, variables.company_id],
      });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateItemDTO }) => {
      const response = await fetch(`${urlPy}/api/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update item");
      }
      return response.json() as Promise<Item>;
    },
    onSuccess: (updatedItem, variables) => {
      const queryKey = [ITEMS_QUERY_KEY, updatedItem.company_id];
      const currentData = queryClient.getQueryData<Item[]>(queryKey) || [];

      const updatedData = currentData.map((item) =>
        item.id === variables.id ? { ...item, ...variables.data } : item
      );

      queryClient.setQueryData(queryKey, updatedData);
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useMutation({
    mutationFn: async (params: { id: number; companyId: number }) => {
      const response = await fetch(`${urlPy}/api/items/${params.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ITEMS_QUERY_KEY, variables.companyId],
      });
    },
  });
}

export function useItem(id: number | null) {
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`${urlPy}/api/items/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch item");
      }
      return response.json() as Promise<Item>;
    },
    enabled: !!id,
  });
}
