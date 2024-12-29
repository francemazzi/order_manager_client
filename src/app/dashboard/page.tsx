"use client";

import { LayoutWithNav } from "../layout-with-nav";
import { useSalesAnalysis } from "@/hooks/use-sales";
import { Loader2, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const { data: salesAnalysis, isLoading: isLoadingAnalysis } =
    useSalesAnalysis(
      date?.from ? format(date.from, "yyyy-MM-dd") : "",
      date?.to ? format(date.to, "yyyy-MM-dd") : ""
    );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <LayoutWithNav>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "d MMMM yyyy", { locale: it })} -{" "}
                      {format(date.to, "d MMMM yyyy", { locale: it })}
                    </>
                  ) : (
                    format(date.from, "d MMMM yyyy", { locale: it })
                  )
                ) : (
                  <span>Seleziona un periodo</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={it}
              />
            </PopoverContent>
          </Popover>
        </div>

        {isLoadingAnalysis ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        ) : salesAnalysis ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(salesAnalysis.data).map(([id, company]) => (
                <Card key={id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{company.company_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Vendite Totali
                        </div>
                        <div className="text-2xl font-bold">
                          {formatCurrency(company.total_sales)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Articoli Venduti
                        </div>
                        <div className="text-2xl font-bold">
                          {company.total_items_sold}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Articoli Più Venduti
                      </div>
                      <div className="space-y-2">
                        {company.top_selling_items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <div className="text-sm">{item.item_name}</div>
                            <div className="text-sm font-medium">
                              {item.quantity} pz
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Valore Medio Ordine
                      </div>
                      <div className="text-xl font-bold">
                        {formatCurrency(company.average_order_value)}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Andamento Vendite
                      </div>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={company.daily_sales.map((day) => ({
                              ...day,
                              date: format(parseISO(day.date), "dd/MM"),
                            }))}
                            margin={{
                              top: 5,
                              right: 10,
                              left: 10,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              stroke="#888888"
                              fontSize={12}
                            />
                            <YAxis
                              stroke="#888888"
                              fontSize={12}
                              tickFormatter={(value) =>
                                `€${value.toLocaleString("it-IT")}`
                              }
                            />
                            <Tooltip
                              formatter={(value: number) =>
                                formatCurrency(value)
                              }
                            />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke="#8884d8"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Analisi Articoli
                      </div>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={company.items_analysis}
                            margin={{
                              top: 5,
                              right: 10,
                              left: 10,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="item_name"
                              stroke="#888888"
                              fontSize={12}
                            />
                            <YAxis
                              stroke="#888888"
                              fontSize={12}
                              tickFormatter={(value) =>
                                value.toLocaleString("it-IT")
                              }
                            />
                            <Tooltip
                              formatter={(value: number) =>
                                value.toLocaleString("it-IT")
                              }
                            />
                            <Bar
                              dataKey="total_quantity"
                              fill="#8884d8"
                              name="Quantità"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </LayoutWithNav>
  );
}
