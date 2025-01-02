import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface InventoryItem {
  current_price: number;
  current_stock: number;
  item_name: string;
  price_unit: string;
  sku: string;
  stock_unit: string;
  stock_value: number;
}

export interface CompanyInventory {
  company_name: string;
  items_detail: InventoryItem[];
  low_stock_items: InventoryItem[];
  total_items: number;
  total_stock_value: number;
}

export interface InventoryAnalysis {
  data: {
    [key: string]: CompanyInventory;
  };
}

export function useInventoryAnalysis() {
  return useQuery<InventoryAnalysis>({
    queryKey: ["inventory-analysis"],
    queryFn: async () => {
      const response = await api.get("/analytics/inventory");
      return response.data;
    },
  });
}
