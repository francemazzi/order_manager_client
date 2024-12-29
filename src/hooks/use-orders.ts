import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type OrderItem = {
  id: number;
  item_id: number;
  item_name: string;
  item_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type Order = {
  id: number;
  company_id: number;
  company_name: string;
  date: string;
  notes: string;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
};

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

const ORDERS_QUERY_KEY = "orders";

export function useOrders() {
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useQuery({
    queryKey: [ORDERS_QUERY_KEY],
    queryFn: async () => {
      const response = await fetch(`${urlPy}/api/orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useCompanyOrders(companyId: number | null) {
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, "company", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const response = await fetch(
        `${urlPy}/api/purchases?company_id=${companyId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch company orders");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!companyId,
  });
}

export type CreateOrderItem = {
  item_id: number;
  quantity: number;
  unit_price: number;
};

export type CreateOrderDTO = {
  company_id: number;
  items: CreateOrderItem[];
  notes: string;
  status: OrderStatus;
};

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useMutation({
    mutationFn: async (data: CreateOrderDTO) => {
      const response = await fetch(`${urlPy}/api/purchases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create order");
      }
      return response.json() as Promise<Order>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ORDERS_QUERY_KEY, "company", variables.company_id],
      });
    },
  });
}

export function useOrderDetails(orderId: number | null) {
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, "details", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await fetch(`${urlPy}/api/purchases/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }
      return response.json() as Promise<Order>;
    },
    enabled: !!orderId,
  });
}
