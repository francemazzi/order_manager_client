"use client";

import { LayoutWithNav } from "../layout-with-nav";
import { useSalesAnalysis } from "@/hooks/use-sales";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "../../components/ui/date-range-picker";
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

export default function AnalyticsPage() {
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

  return (
    <LayoutWithNav>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white">
            Analisi Vendite
          </h1>
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
            {companies.map((company) => (
              <div key={company.company_name} className="space-y-6">
                <h2 className="text-xl font-semibold">
                  {company.company_name}
                </h2>

                {/* Statistiche generali */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Totale Vendite
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(company.total_sales)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Articoli Venduti
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {company.total_items_sold}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Valore Medio Ordine
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(company.average_order_value)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Grafico vendite giornaliere */}
                <Card>
                  <CardHeader>
                    <CardTitle>Andamento Vendite</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
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
                          labels: company.daily_sales.map((day) => day.date),
                          datasets: [
                            {
                              label: "Ricavi",
                              data: company.daily_sales.map(
                                (day) => day.revenue
                              ),
                              borderColor: "rgb(99, 102, 241)",
                              backgroundColor: "rgba(99, 102, 241, 0.5)",
                            },
                            {
                              label: "Quantità",
                              data: company.daily_sales.map(
                                (day) => day.quantity
                              ),
                              borderColor: "rgb(251, 146, 60)",
                              backgroundColor: "rgba(251, 146, 60, 0.5)",
                            },
                          ],
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Grafico articoli più venduti */}
                <Card>
                  <CardHeader>
                    <CardTitle>Articoli Più Venduti</CardTitle>
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
                          labels: company.top_selling_items.map(
                            (item) => item.item_name
                          ),
                          datasets: [
                            {
                              data: company.top_selling_items.map(
                                (item) => item.revenue
                              ),
                              backgroundColor: "rgba(99, 102, 241, 0.5)",
                              borderColor: "rgb(99, 102, 241)",
                              borderWidth: 1,
                            },
                          ],
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Tabella analisi articoli */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dettaglio Articoli</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead className="text-right">
                              Quantità
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
                          {company.items_analysis.map((item) => (
                            <TableRow key={item.sku}>
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
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
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
