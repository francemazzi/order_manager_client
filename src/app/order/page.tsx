"use client";

import { LayoutWithNav } from "../layout-with-nav";
import { useCompanies } from "@/hooks/use-companies";
import {
  useCompanyOrders,
  ORDER_STATUS,
  useCreateOrder,
  useOrderDetails,
} from "@/hooks/use-orders";
import { useItems } from "@/hooks/use-items";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function OrderPage() {
  const { data: companies } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );
  const {
    data: orders,
    isLoading,
    error,
  } = useCompanyOrders(selectedCompanyId);
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<
    Array<{ id: number; quantity: number }>
  >([]);
  const [notes, setNotes] = useState("");
  const { data: items } = useItems(selectedCompanyId || 0);
  const createOrder = useCreateOrder();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const { data: selectedOrder, isLoading: isLoadingOrder } =
    useOrderDetails(selectedOrderId);

  useEffect(() => {
    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare gli ordini",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const orderStats = orders?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredOrders = selectedStatus
    ? orders?.filter((order) => order.status === selectedStatus)
    : orders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return "bg-yellow-500";
      case ORDER_STATUS.CONFIRMED:
        return "bg-blue-500";
      case ORDER_STATUS.DELIVERED:
        return "bg-green-500";
      case ORDER_STATUS.CANCELLED:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const handleCreateOrder = async () => {
    if (!selectedCompanyId || !items) return;

    try {
      await createOrder.mutateAsync({
        company_id: selectedCompanyId,
        items: selectedItems.map((selected) => {
          const item = items.find((i) => i.id === selected.id);
          if (!item) throw new Error("Item not found");
          return {
            item_id: selected.id,
            quantity: selected.quantity,
            unit_price: item.price,
          };
        }),
        notes,
        status: ORDER_STATUS.PENDING,
      });

      toast({
        title: "Successo",
        description: "Ordine creato con successo",
      });
      setOpen(false);
      setSelectedItems([]);
      setNotes("");
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile creare l'ordine",
        variant: "destructive",
      });
    }
  };

  const handleItemChange = (itemId: number, quantity: number) => {
    setSelectedItems((prev) => {
      const itemIndex = prev.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) {
        return [...prev, { id: itemId, quantity }];
      }
      return prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
    });
  };

  return (
    <LayoutWithNav>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold dark:text-white">Gestione Ordini</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(ORDER_STATUS).map(([key, status]) => (
            <Card
              key={status}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() =>
                setSelectedStatus(status === selectedStatus ? null : status)
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orderStats?.[status] || 0}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold dark:text-white">
                  Lista Ordini
                </h2>
                <Select
                  value={selectedCompanyId ? String(selectedCompanyId) : ""}
                  onValueChange={(value) =>
                    setSelectedCompanyId(value ? Number(value) : null)
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Seleziona un fornitore" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.map((company) => (
                      <SelectItem key={company.id} value={String(company.id)}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={!selectedCompanyId}
                  >
                    <Plus className="h-4 w-4" />
                    Nuovo Ordine
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Crea Nuovo Ordine</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Articoli</Label>
                      <div className="mt-2 space-y-2">
                        {items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-2 border rounded"
                          >
                            <div className="flex-1">
                              <div>{item.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Prezzo unitario: {formatCurrency(item.price)}
                              </div>
                              {selectedItems.find((i) => i.id === item.id)
                                ?.quantity ? (
                                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                  Totale:{" "}
                                  {formatCurrency(
                                    item.price *
                                      selectedItems.find(
                                        (i) => i.id === item.id
                                      )!.quantity
                                  )}
                                </div>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="Quantità"
                                className="w-24"
                                min={0}
                                value={
                                  selectedItems.find((i) => i.id === item.id)
                                    ?.quantity || ""
                                }
                                onChange={(e) =>
                                  handleItemChange(
                                    item.id,
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Note</Label>
                      <Input
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        Annulla
                      </Button>
                      <Button
                        onClick={handleCreateOrder}
                        disabled={
                          createOrder.isPending || selectedItems.length === 0
                        }
                      >
                        {createOrder.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Crea Ordine"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
              </div>
            ) : selectedCompanyId ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Fornitore
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Note
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Totale
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Stato
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredOrders?.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          {order.id}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {formatDate(order.date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {order.company_name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {order.notes}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge
                            className={`${getStatusColor(
                              order.status
                            )} text-white`}
                          >
                            {order.status.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex justify-center items-center h-32 text-gray-500 dark:text-gray-400">
                Seleziona un fornitore per visualizzare gli ordini
              </div>
            )}
          </div>
        </div>

        <Dialog
          open={!!selectedOrderId}
          onOpenChange={(open) => !open && setSelectedOrderId(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Dettagli Ordine #{selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {isLoadingOrder ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : selectedOrder ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fornitore</Label>
                    <div className="mt-1 text-sm">
                      {selectedOrder.company_name}
                    </div>
                  </div>
                  <div>
                    <Label>Data</Label>
                    <div className="mt-1 text-sm">
                      {formatDate(selectedOrder.date)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Note</Label>
                  <div className="mt-1 text-sm">
                    {selectedOrder.notes || "-"}
                  </div>
                </div>

                <div>
                  <Label>Articoli</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                            Nome
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                            SKU
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">
                            Quantità
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">
                            Prezzo Unitario
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">
                            Totale
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm">
                              {item.item_name}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {item.item_sku}
                            </td>
                            <td className="px-4 py-2 text-sm text-right">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 text-sm text-right">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="px-4 py-2 text-sm text-right font-medium">
                              {formatCurrency(item.total_price)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <td
                            colSpan={4}
                            className="px-4 py-2 text-sm font-medium text-right"
                          >
                            Totale Ordine
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-bold">
                            {formatCurrency(selectedOrder.total_amount)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Stato</Label>
                    <div className="mt-1">
                      <Badge
                        className={`${getStatusColor(
                          selectedOrder.status
                        )} text-white`}
                      >
                        {selectedOrder.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Ultima Modifica</Label>
                    <div className="mt-1 text-sm">
                      {formatDate(selectedOrder.updated_at)}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </LayoutWithNav>
  );
}
