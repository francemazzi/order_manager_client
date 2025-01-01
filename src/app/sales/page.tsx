"use client";

import { LayoutWithNav } from "../layout-with-nav";
import {
  useSales,
  SALE_STATUS,
  useSaleDetails,
  useCreateSale,
  type CreateSaleDTO,
} from "@/hooks/use-sales";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useItems } from "@/hooks/use-items";
import { useCompanies } from "@/hooks/use-companies";

export default function SalesPage() {
  const { data: sales, isLoading, error } = useSales();
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const { data: selectedSale, isLoading: isLoadingSale } =
    useSaleDetails(selectedSaleId);
  const [open, setOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );
  const { data: companies } = useCompanies();
  const { data: items } = useItems(selectedCompanyId || 0);
  const createSale = useCreateSale();
  const [formData, setFormData] = useState<CreateSaleDTO>({
    customer_name: "",
    customer_email: "",
    customer_address: "",
    customer_phone: "",
    company_id: 0,
    items: [],
    notes: "",
    status: "pending",
  });

  const customerCompanies = companies?.filter(
    (company) => company.tag === "customer"
  );

  useEffect(() => {
    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare le vendite",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (selectedCompanyId) {
      const company = companies?.find((c) => c.id === selectedCompanyId);
      if (company) {
        setFormData((prev) => ({
          ...prev,
          customer_name: company.name,
          customer_email: company.email,
          customer_address: company.address,
          customer_phone: company.phone,
          company_id: company.id,
        }));
      }
    }
  }, [selectedCompanyId, companies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSale.mutateAsync(formData);
      toast({
        title: "Successo",
        description: "Vendita creata con successo",
      });
      setOpen(false);
      setFormData({
        customer_name: "",
        customer_email: "",
        customer_address: "",
        customer_phone: "",
        company_id: 0,
        items: [],
        notes: "",
        status: "pending",
      });
      setSelectedCompanyId(null);
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile creare la vendita",
        variant: "destructive",
      });
    }
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { item_id: 0, quantity: 1, unit_price: 0 }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof CreateSaleDTO["items"][0],
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const salesStats = sales?.reduce((acc, sale) => {
    acc[sale.status] = (acc[sale.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredSales = selectedStatus
    ? sales?.filter((sale) => sale.status === selectedStatus)
    : sales;

  const getStatusColor = (status: string) => {
    switch (status) {
      case SALE_STATUS.PENDING:
        return "bg-yellow-500";
      case SALE_STATUS.CONFIRMED:
        return "bg-blue-500";
      case SALE_STATUS.SHIPPED:
        return "bg-purple-500";
      case SALE_STATUS.DELIVERED:
        return "bg-green-500";
      case SALE_STATUS.CANCELLED:
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

  return (
    <LayoutWithNav>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white">
            Gestione Vendite
          </h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuova Vendita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Crea Nuova Vendita</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label>Cliente</Label>
                  <Select
                    value={selectedCompanyId?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedCompanyId(Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerCompanies?.map((company) => (
                        <SelectItem key={company.id} value={String(company.id)}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCompanyId && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nome Azienda</Label>
                      <Input value={formData.customer_name} disabled />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={formData.customer_email} disabled />
                    </div>
                    <div>
                      <Label>Telefono</Label>
                      <Input value={formData.customer_phone} disabled />
                    </div>
                    <div>
                      <Label>Indirizzo</Label>
                      <Input value={formData.customer_address} disabled />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Articoli</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddItem}
                      disabled={!selectedCompanyId}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Aggiungi Articolo
                    </Button>
                  </div>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-end gap-4">
                      <div className="flex-1">
                        <Label>Articolo</Label>
                        <Select
                          value={String(item.item_id)}
                          onValueChange={(value) => {
                            const selectedItem = items?.find(
                              (i) => i.id === Number(value)
                            );
                            handleItemChange(index, "item_id", Number(value));
                            if (selectedItem) {
                              handleItemChange(
                                index,
                                "unit_price",
                                selectedItem.price
                              );
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona un articolo" />
                          </SelectTrigger>
                          <SelectContent>
                            {items?.map((i) => (
                              <SelectItem key={i.id} value={String(i.id)}>
                                {i.name} - {formatCurrency(i.price)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-32">
                        <Label>Quantità</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div>
                  <Label htmlFor="notes">Note</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createSale.isPending ||
                      formData.items.length === 0 ||
                      !selectedCompanyId
                    }
                  >
                    {createSale.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Crea"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(SALE_STATUS).map(([key, status]) => (
            <Card
              key={status}
              className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                selectedStatus === status ? "ring-2 ring-primary" : ""
              }`}
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
                  {salesStats?.[status] || 0}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold dark:text-white">
                Lista Vendite
              </h2>
              <div className="flex items-center gap-4">
                <Select
                  value={selectedStatus || "all"}
                  onValueChange={(value) =>
                    setSelectedStatus(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtra per stato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli stati</SelectItem>
                    {Object.entries(SALE_STATUS).map(([key, status]) => (
                      <SelectItem key={status} value={status}>
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
              </div>
            ) : (
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
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Telefono
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Indirizzo
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
                    {filteredSales?.map((sale) => (
                      <tr
                        key={sale.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => setSelectedSaleId(sale.id)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          {sale.id}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {formatDate(sale.date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {sale.customer_name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {sale.customer_email}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {sale.customer_phone}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {sale.customer_address}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {sale.notes}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {formatCurrency(sale.total_amount)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge
                            className={`${getStatusColor(
                              sale.status
                            )} text-white`}
                          >
                            {sale.status.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <Dialog
          open={!!selectedSaleId}
          onOpenChange={(open) => !open && setSelectedSaleId(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Dettagli Vendita #{selectedSale?.id}</DialogTitle>
            </DialogHeader>
            {isLoadingSale ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : selectedSale ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cliente</Label>
                    <div className="mt-1 text-sm">
                      {selectedSale.customer_name}
                    </div>
                  </div>
                  <div>
                    <Label>Data</Label>
                    <div className="mt-1 text-sm">
                      {formatDate(selectedSale.date)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <div className="mt-1 text-sm">
                      {selectedSale.customer_email}
                    </div>
                  </div>
                  <div>
                    <Label>Telefono</Label>
                    <div className="mt-1 text-sm">
                      {selectedSale.customer_phone}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Indirizzo</Label>
                  <div className="mt-1 text-sm">
                    {selectedSale.customer_address}
                  </div>
                </div>

                <div>
                  <Label>Note</Label>
                  <div className="mt-1 text-sm">
                    {selectedSale.notes || "-"}
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
                        {selectedSale.items.map((item) => (
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
                            Totale Vendita
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-bold">
                            {formatCurrency(selectedSale.total_amount)}
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
                          selectedSale.status
                        )} text-white`}
                      >
                        {selectedSale.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Ultima Modifica</Label>
                    <div className="mt-1 text-sm">
                      {formatDate(selectedSale.updated_at)}
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
