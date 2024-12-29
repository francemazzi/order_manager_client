import { useQuery } from "@tanstack/react-query";

export type SaleItem = {
  id: number;
  item_id: number;
  item_name: string;
  item_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type Sale = {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  date: string;
  notes: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
};

export const SALE_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type SaleStatus = (typeof SALE_STATUS)[keyof typeof SALE_STATUS];

const SALES_QUERY_KEY = "sales";

export function useSales() {
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useQuery({
    queryKey: [SALES_QUERY_KEY],
    queryFn: async () => {
      const response = await fetch(`${urlPy}/api/sales`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch sales");
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useSaleDetails(saleId: number | null) {
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useQuery({
    queryKey: [SALES_QUERY_KEY, "details", saleId],
    queryFn: async () => {
      if (!saleId) return null;
      const response = await fetch(`${urlPy}/api/sales/${saleId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch sale details");
      }
      return response.json() as Promise<Sale>;
    },
    enabled: !!saleId,
  });
}
