"use client";

import { LayoutWithNav } from "../layout-with-nav";
import { useSalesAnalysis } from "@/hooks/use-sales";
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

  return (
    <LayoutWithNav>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
          <DatePickerWithRange
            date={dateRange}
            onDateChange={handleDateChange}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        ) : companies.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        labels: companies.map(
                          (company) => company.company_name
                        ),
                        datasets: [
                          {
                            data: companies.map(
                              (company) => company.total_sales
                            ),
                            backgroundColor: companies.map(
                              (_, i) =>
                                companyColors[i % companyColors.length].bg
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
                        labels: companies.map(
                          (company) => company.company_name
                        ),
                        datasets: [
                          {
                            data: companies.map(
                              (company) => company.total_items_sold
                            ),
                            backgroundColor: companies.map(
                              (_, i) =>
                                companyColors[i % companyColors.length].bg
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
                        labels: companies.map(
                          (company) => company.company_name
                        ),
                        datasets: [
                          {
                            data: companies.map(
                              (company) => company.average_order_value
                            ),
                            backgroundColor: companies.map(
                              (_, i) =>
                                companyColors[i % companyColors.length].bg
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
            </div>

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
