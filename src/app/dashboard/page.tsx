"use client";

import { LayoutWithNav } from "../layout-with-nav";
import {
  useSalesAnalysis,
  useBrandAverages,
  useBrandPopularity,
  useBrandSales,
  useTopItems,
} from "@/hooks/use-sales";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { format, subYears } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const defaultEndDate = new Date();
  const defaultStartDate = subYears(defaultEndDate, 1);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: defaultStartDate,
    to: defaultEndDate,
  });

  const { data: salesAnalysis, isLoading } = useSalesAnalysis(
    format(dateRange?.from || defaultStartDate, "yyyy-MM-dd"),
    format(dateRange?.to || defaultEndDate, "yyyy-MM-dd")
  );

  const handleDateChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const companies = salesAnalysis ? Object.values(salesAnalysis.data) : [];

  const companyColors = [
    { bg: "rgba(99, 102, 241, 0.5)", border: "rgb(99, 102, 241)" },
    { bg: "rgba(251, 146, 60, 0.5)", border: "rgb(251, 146, 60)" },
    { bg: "rgba(34, 197, 94, 0.5)", border: "rgb(34, 197, 94)" },
    { bg: "rgba(236, 72, 153, 0.5)", border: "rgb(236, 72, 153)" },
  ];

  const [averagePeriod, setAveragePeriod] = useState<"monthly" | "weekly">(
    "monthly"
  );
  const { data: brandAverages, isLoading: isLoadingAverages } =
    useBrandAverages(averagePeriod);

  const { data: brandPopularity, isLoading: isLoadingPopularity } =
    useBrandPopularity();

  const { data: brandSales, isLoading: isLoadingBrandSales } = useBrandSales();

  const { data: topItems, isLoading: isLoadingTopItems } = useTopItems(
    format(dateRange?.from || defaultStartDate, "yyyy-MM-dd"),
    format(dateRange?.to || defaultEndDate, "yyyy-MM-dd")
  );

  return (
    <LayoutWithNav>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Select
              value={averagePeriod}
              onValueChange={(value) =>
                setAveragePeriod(value as "monthly" | "weekly")
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Seleziona periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensile</SelectItem>
                <SelectItem value="weekly">Settimanale</SelectItem>
              </SelectContent>
            </Select>
            <DatePickerWithRange
              date={dateRange}
              onDateChange={handleDateChange}
            />
          </div>
        </div>

        {isLoading ||
        isLoadingAverages ||
        isLoadingPopularity ||
        isLoadingBrandSales ||
        isLoadingTopItems ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        ) : companies.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vendite Totali per Brand</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <Bar
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                return `Vendite: ${formatCurrency(
                                  context.raw as number
                                )}`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Vendite Totali (€)",
                            },
                          },
                        },
                      }}
                      data={{
                        labels: brandSales?.brands || [],
                        datasets: [
                          {
                            data: brandSales?.sales || [],
                            backgroundColor:
                              brandSales?.brands.map(
                                (_, i) =>
                                  companyColors[i % companyColors.length].bg
                              ) || [],
                            borderColor:
                              brandSales?.brands.map(
                                (_, i) =>
                                  companyColors[i % companyColors.length].border
                              ) || [],
                            borderWidth: 1,
                          },
                        ],
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Media Vendite per Brand (
                    {averagePeriod === "monthly" ? "Mensile" : "Settimanale"})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <Bar
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                return `Media: ${formatCurrency(
                                  context.raw as number
                                )}`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Media Vendite (€)",
                            },
                          },
                        },
                      }}
                      data={{
                        labels: brandAverages?.brands || [],
                        datasets: [
                          {
                            data: brandAverages?.averages || [],
                            backgroundColor:
                              brandAverages?.brands.map(
                                (_, i) =>
                                  companyColors[i % companyColors.length].bg
                              ) || [],
                            borderColor:
                              brandAverages?.brands.map(
                                (_, i) =>
                                  companyColors[i % companyColors.length].border
                              ) || [],
                            borderWidth: 1,
                          },
                        ],
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popolarità Brand</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <Bar
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                return `Popolarità: ${(
                                  context.raw as number
                                ).toFixed(2)}%`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                              display: true,
                              text: "Popolarità (%)",
                            },
                          },
                        },
                      }}
                      data={{
                        labels: brandPopularity?.brands || [],
                        datasets: [
                          {
                            data: brandPopularity?.popularity || [],
                            backgroundColor:
                              brandPopularity?.brands.map(
                                (_, i) =>
                                  companyColors[i % companyColors.length].bg
                              ) || [],
                            borderColor:
                              brandPopularity?.brands.map(
                                (_, i) =>
                                  companyColors[i % companyColors.length].border
                              ) || [],
                            borderWidth: 1,
                          },
                        ],
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Riepilogo Top Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Prezzo Medio
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          topItems?.data.summary.average_price || 0
                        )}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Articoli Venduti
                      </p>
                      <p className="text-2xl font-bold">
                        {topItems?.data.summary.total_items_sold || 0}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Ricavo Totale
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          topItems?.data.summary.total_revenue || 0
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Items per Ricavo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Bar
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: "y" as const,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                return `Ricavo: ${formatCurrency(
                                  context.raw as number
                                )}`;
                              },
                            },
                          },
                        },
                        scales: {
                          x: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Ricavo (€)",
                            },
                          },
                        },
                      }}
                      data={{
                        labels:
                          topItems?.data.top_items.map(
                            (item) => item.item_name
                          ) || [],
                        datasets: [
                          {
                            data:
                              topItems?.data.top_items.map(
                                (item) => item.total_revenue
                              ) || [],
                            backgroundColor:
                              topItems?.data.top_items.map(
                                (_, i) =>
                                  companyColors[i % companyColors.length].bg
                              ) || [],
                            borderColor:
                              topItems?.data.top_items.map(
                                (_, i) =>
                                  companyColors[i % companyColors.length].border
                              ) || [],
                            borderWidth: 1,
                          },
                        ],
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Dettaglio Top Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">
                          Stock Attuale
                        </TableHead>
                        <TableHead className="text-right">
                          Quantità Venduta
                        </TableHead>
                        <TableHead className="text-right">
                          Prezzo Medio
                        </TableHead>
                        <TableHead className="text-right">
                          Ricavo Totale
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topItems?.data.top_items.map((item) => (
                        <TableRow key={item.item_id}>
                          <TableCell className="font-medium">
                            {item.sku}
                          </TableCell>
                          <TableCell>{item.item_name}</TableCell>
                          <TableCell>{item.company.name}</TableCell>
                          <TableCell className="text-right">
                            {item.current_stock}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.total_quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.average_price)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.total_revenue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Totale Vendite per Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                    data={{
                      labels: companies.map((company) => company.company_name),
                      datasets: [
                        {
                          data: companies.map((company) => company.total_sales),
                          backgroundColor: companies.map(
                            (_, i) => companyColors[i % companyColors.length].bg
                          ),
                          borderColor: companies.map(
                            (_, i) =>
                              companyColors[i % companyColors.length].border
                          ),
                          borderWidth: 1,
                        },
                      ],
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Articoli Venduti per Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                    data={{
                      labels: companies.map((company) => company.company_name),
                      datasets: [
                        {
                          data: companies.map(
                            (company) => company.total_items_sold
                          ),
                          backgroundColor: companies.map(
                            (_, i) => companyColors[i % companyColors.length].bg
                          ),
                          borderColor: companies.map(
                            (_, i) =>
                              companyColors[i % companyColors.length].border
                          ),
                          borderWidth: 1,
                        },
                      ],
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Valore Medio Ordine per Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                    data={{
                      labels: companies.map((company) => company.company_name),
                      datasets: [
                        {
                          data: companies.map(
                            (company) => company.average_order_value
                          ),
                          backgroundColor: companies.map(
                            (_, i) => companyColors[i % companyColors.length].bg
                          ),
                          borderColor: companies.map(
                            (_, i) =>
                              companyColors[i % companyColors.length].border
                          ),
                          borderWidth: 1,
                        },
                      ],
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Andamento Vendite per Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <Line
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                    data={{
                      labels: Array.from(
                        new Set(
                          companies.flatMap((company) =>
                            company.daily_sales.map((day) => day.date)
                          )
                        )
                      ).sort(),
                      datasets: companies.map((company, index) => ({
                        label: company.company_name,
                        data: company.daily_sales.map((day) => ({
                          x: day.date,
                          y: day.revenue,
                        })),
                        borderColor:
                          companyColors[index % companyColors.length].border,
                        backgroundColor:
                          companyColors[index % companyColors.length].bg,
                        tension: 0.4,
                      })),
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valore Stock per Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <Bar
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: "y" as const,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              return [
                                `Valore Stock: ${formatCurrency(
                                  context.raw as number
                                )}`,
                                `Articoli: ${
                                  companies[context.dataIndex].items_analysis
                                    .length
                                }`,
                              ];
                            },
                          },
                        },
                      },
                      scales: {
                        x: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Valore Stock (€)",
                          },
                        },
                        y: {
                          title: {
                            display: true,
                            text: "Cliente",
                          },
                        },
                      },
                    }}
                    data={{
                      labels: companies.map((company) => company.company_name),
                      datasets: [
                        {
                          data: companies.map((company) =>
                            company.items_analysis.reduce(
                              (acc, item) =>
                                acc + item.average_price * item.total_quantity,
                              0
                            )
                          ),
                          backgroundColor: companies.map(
                            (_, i) => companyColors[i % companyColors.length].bg
                          ),
                          borderColor: companies.map(
                            (_, i) =>
                              companyColors[i % companyColors.length].border
                          ),
                          borderWidth: 1,
                        },
                      ],
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dettaglio Articoli per Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead className="text-right">Quantità</TableHead>
                        <TableHead className="text-right">
                          Prezzo Medio
                        </TableHead>
                        <TableHead className="text-right">
                          Ricavo Totale
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.flatMap((company) =>
                        company.items_analysis.map((item) => (
                          <TableRow key={`${company.company_name}-${item.sku}`}>
                            <TableCell>{company.company_name}</TableCell>
                            <TableCell className="font-medium">
                              {item.sku}
                            </TableCell>
                            <TableCell>{item.item_name}</TableCell>
                            <TableCell className="text-right">
                              {item.total_quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.average_price)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.total_revenue)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Nessun dato disponibile per il periodo selezionato
          </div>
        )}
      </div>
    </LayoutWithNav>
  );
}
