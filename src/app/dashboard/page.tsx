"use client";

import { LayoutWithNav } from "../layout-with-nav";
import {
  useInventoryAnalysis,
  type CompanyInventory,
} from "@/hooks/use-inventory";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartEvent,
  ActiveElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Valore Stock per Azienda",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export default function DashboardPage() {
  const { data: inventoryAnalysis, isLoading } = useInventoryAnalysis();
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyInventory | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const companies = inventoryAnalysis
    ? Object.values(inventoryAnalysis.data)
    : [];

  const companyGroups = [];
  for (let i = 0; i < companies.length; i += 4) {
    companyGroups.push(companies.slice(i, i + 4));
  }

  const handleBarClick = (groupIndex: number, localIndex: number) => {
    const globalIndex = groupIndex * 4 + localIndex;
    const company = companies[globalIndex];
    if (company) {
      setSelectedCompany(company);
    }
  };

  return (
    <LayoutWithNav>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        ) : inventoryAnalysis ? (
          <div className="px-12">
            <Carousel>
              <CarouselContent>
                {companyGroups.map((group, groupIndex) => (
                  <CarouselItem key={groupIndex}>
                    <Card className="p-6">
                      <CardContent className="h-[400px]">
                        <Dialog>
                          <DialogTrigger asChild>
                            <div>
                              <Bar
                                options={{
                                  ...chartOptions,
                                  onClick: (
                                    _: ChartEvent,
                                    elements: ActiveElement[]
                                  ) => {
                                    if (elements.length > 0) {
                                      handleBarClick(
                                        groupIndex,
                                        elements[0].index
                                      );
                                    }
                                  },
                                }}
                                data={{
                                  labels: group.map(
                                    (company) => company.company_name
                                  ),
                                  datasets: [
                                    {
                                      data: group.map(
                                        (company) => company.total_stock_value
                                      ),
                                      backgroundColor:
                                        "rgba(99, 102, 241, 0.5)",
                                      borderColor: "rgb(99, 102, 241)",
                                      borderWidth: 1,
                                    },
                                  ],
                                }}
                              />
                            </div>
                          </DialogTrigger>
                          {selectedCompany && (
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>
                                  {selectedCompany.company_name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="text-sm text-gray-500">
                                  Dettagli dell&apos;inventario per{" "}
                                  {selectedCompany.company_name}
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      Valore Totale Stock
                                    </div>
                                    <div className="text-2xl font-bold">
                                      {formatCurrency(
                                        selectedCompany.total_stock_value
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      Totale Articoli
                                    </div>
                                    <div className="text-2xl font-bold">
                                      {selectedCompany.total_items}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    Dettaglio Articoli
                                  </div>
                                  <div className="border rounded-lg">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="w-[120px]">
                                            SKU
                                          </TableHead>
                                          <TableHead className="w-[200px]">
                                            Nome
                                          </TableHead>
                                          <TableHead className="w-[120px]">
                                            Stock
                                          </TableHead>
                                          <TableHead className="w-[120px]">
                                            Prezzo
                                          </TableHead>
                                          <TableHead className="w-[120px]">
                                            Valore Stock
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedCompany.items_detail.map(
                                          (item) => (
                                            <TableRow key={item.sku}>
                                              <TableCell className="font-medium">
                                                {item.sku}
                                              </TableCell>
                                              <TableCell>
                                                {item.item_name}
                                              </TableCell>
                                              <TableCell>
                                                {item.current_stock}{" "}
                                                {item.stock_unit}
                                              </TableCell>
                                              <TableCell>
                                                {formatCurrency(
                                                  item.current_price
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                {formatCurrency(
                                                  item.stock_value
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          )
                                        )}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        ) : null}
      </div>
    </LayoutWithNav>
  );
}
