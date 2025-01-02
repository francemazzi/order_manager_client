import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface CustomerSalesAnalysis {
  customer_name: string;
  total_amount: number;
  total_items: number;
  items_detail: {
    sku: string;
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

export interface SalesAnalysisResponse {
  data: Record<string, CustomerSalesAnalysis>;
}

export function useCustomerSalesAnalysis() {
  return useQuery<SalesAnalysisResponse>({
    queryKey: ["customerSalesAnalysis"],
    queryFn: async () => {
      const response = await api.get("/analytics/customer-sales");
      return response.data;
    },
  });
}
