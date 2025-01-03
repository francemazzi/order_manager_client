import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type SaleItem = {
  id: number;
  item_id: number;
  item_name: string;
  item_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  gross_margin: number | null;
};

export type Sale = {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  company_id: number;
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

export type SalesAnalysisItemData = {
  item_name: string;
  sku: string;
  total_quantity: number;
  total_revenue: number;
  average_price: number;
};

export type DailySalesData = {
  date: string;
  revenue: number;
  quantity: number;
};

export type CompanyAnalysis = {
  company_name: string;
  total_sales: number;
  total_items_sold: number;
  average_order_value: number;
  items_analysis: SalesAnalysisItemData[];
  daily_sales: DailySalesData[];
  top_selling_items: {
    item_name: string;
    sku: string;
    quantity: number;
    revenue: number;
  }[];
};

export type SalesAnalysis = {
  data: Record<string, CompanyAnalysis>;
  period: {
    start_date: string;
    end_date: string;
  };
};

export function useSalesAnalysis(startDate: string, endDate: string) {
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useQuery({
    queryKey: ["sales-analysis", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(
        `${urlPy}/api/analytics/sales?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch sales analysis");
      }
      return response.json() as Promise<SalesAnalysis>;
    },
  });
}

export type CreateSaleItem = {
  item_id: number;
  quantity: number;
  unit_price: number;
  gross_margin?: number;
};

export type CreateSaleDTO = {
  customer_name: string;
  customer_email: string;
  customer_address: string;
  customer_phone: string;
  company_id: number;
  items: CreateSaleItem[];
  notes: string;
  status: SaleStatus;
};

export function useCreateSale() {
  const queryClient = useQueryClient();
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useMutation({
    mutationFn: async (data: CreateSaleDTO) => {
      const response = await fetch(`${urlPy}/api/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create sale");
      }
      return response.json() as Promise<Sale>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SALES_QUERY_KEY] });
    },
  });
}
