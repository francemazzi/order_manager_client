"use client";

import { LayoutWithNav } from "../layout-with-nav";
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useItem,
  type CreateItemDTO,
  type UpdateItemDTO,
} from "@/hooks/use-items";
import { useCompanies } from "@/hooks/use-companies";
import { useToast } from "@/components/ui/use-toast";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditableCellWithSelect } from "@/components/ui/editable-cell-with-select";

export default function ItemPage() {
  const { data: companies } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );
  const { data: items, isLoading, error } = useItems(selectedCompanyId || 0);
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<UpdateItemDTO>({});
  const [formData, setFormData] = useState<CreateItemDTO>({
    name: "",
    description: "",
    price: 0,
    price_unit: "EUR",
    sku: "",
    stock: 0,
    stock_unit: "PZ",
    company_id: 0,
  });
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const { data: selectedItem, isLoading: isLoadingItem } =
    useItem(selectedItemId);

  useEffect(() => {
    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare gli articoli",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;

    try {
      await createItem.mutateAsync({
        ...formData,
        company_id: selectedCompanyId,
      });
      toast({
        title: "Successo",
        description: "Articolo creato con successo",
      });
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        price: 0,
        price_unit: "EUR",
        sku: "",
        stock: 0,
        stock_unit: "PZ",
        company_id: 0,
      });
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile creare l'articolo",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    setEditedData({});
  };

  const handleSave = async (id: number) => {
    if (Object.keys(editedData).length === 0) {
      setEditingId(null);
      return;
    }

    try {
      await updateItem.mutateAsync({ id, data: editedData });
      toast({
        title: "Successo",
        description: "Articolo aggiornato con successo",
      });
      setEditingId(null);
      setEditedData({});
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'articolo",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number, companyId: number) => {
    try {
      await deleteItem.mutateAsync({ id, companyId });
      toast({
        title: "Successo",
        description: "Articolo eliminato con successo",
      });
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'articolo",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  return (
    <LayoutWithNav>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold dark:text-white">
          Gestione Articoli
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold dark:text-white">
                  Lista Articoli
                </h2>
                <Select
                  value={selectedCompanyId ? String(selectedCompanyId) : ""}
                  onValueChange={(value) =>
                    setSelectedCompanyId(value ? Number(value) : null)
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Seleziona un'azienda" />
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
                    Aggiungi articolo a questo fornitore
                    {/* Nuovo articolo in{" "}
                    {companies?.find((c) => c.id === selectedCompanyId)?.name} */}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crea Nuovo Articolo</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrizione</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData({ ...formData, sku: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Prezzo</Label>
                        <Input
                          id="price"
                          type="number"
                          min={0}
                          step={0.01}
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price: Number(e.target.value),
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Quantità</Label>
                        <Input
                          id="stock"
                          type="number"
                          min={0}
                          value={formData.stock}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              stock: Number(e.target.value),
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        Annulla
                      </Button>
                      <Button type="submit" disabled={createItem.isPending}>
                        {createItem.isPending ? (
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
                        Nome
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Descrizione
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Prezzo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Quantità
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {items?.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => setSelectedItemId(item.id)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <EditableCellWithSelect
                            value={item.name}
                            isEditing={editingId === item.id}
                            onChange={(value) =>
                              setEditedData({
                                ...editedData,
                                name: value,
                              })
                            }
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <EditableCellWithSelect
                            value={item.description}
                            isEditing={editingId === item.id}
                            onChange={(value) =>
                              setEditedData({
                                ...editedData,
                                description: value,
                              })
                            }
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <EditableCellWithSelect
                            value={item.sku}
                            isEditing={editingId === item.id}
                            onChange={(value) =>
                              setEditedData({
                                ...editedData,
                                sku: value,
                              })
                            }
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <EditableCellWithSelect
                            value={String(item.price)}
                            type="number"
                            isEditing={editingId === item.id}
                            onChange={(value) =>
                              setEditedData({
                                ...editedData,
                                price: Number(value),
                              })
                            }
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <EditableCellWithSelect
                            value={String(item.stock)}
                            type="number"
                            isEditing={editingId === item.id}
                            onChange={(value) =>
                              setEditedData({
                                ...editedData,
                                stock: Number(value),
                              })
                            }
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            {editingId === item.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancel}
                                  className="text-gray-600 dark:text-gray-400"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSave(item.id)}
                                  className="text-green-600 dark:text-green-400"
                                  disabled={updateItem.isPending}
                                >
                                  {updateItem.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(item.id)}
                                  className="text-blue-600 dark:text-blue-400"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleDelete(item.id, item.company_id)
                                  }
                                  className="text-red-600 dark:text-red-400"
                                  disabled={deleteItem.isPending}
                                >
                                  {deleteItem.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex justify-center items-center h-32 text-gray-500 dark:text-gray-400">
                Seleziona un&apos;azienda per visualizzare gli articoli
              </div>
            )}
          </div>
        </div>
        <Dialog
          open={!!selectedItemId}
          onOpenChange={(open) => !open && setSelectedItemId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dettagli Articolo</DialogTitle>
            </DialogHeader>
            {isLoadingItem ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : selectedItem ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome</Label>
                    <div className="mt-1 text-sm">{selectedItem.name}</div>
                  </div>
                  <div>
                    <Label>SKU</Label>
                    <div className="mt-1 text-sm">{selectedItem.sku}</div>
                  </div>
                </div>
                <div>
                  <Label>Descrizione</Label>
                  <div className="mt-1 text-sm">{selectedItem.description}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Prezzo</Label>
                    <div className="mt-1 text-sm">
                      {selectedItem.price} {selectedItem.price_unit}
                    </div>
                  </div>
                  <div>
                    <Label>Quantità</Label>
                    <div className="mt-1 text-sm">
                      {selectedItem.stock} {selectedItem.stock_unit}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data Creazione</Label>
                    <div className="mt-1 text-sm">
                      {new Date(selectedItem.created_at).toLocaleString(
                        "it-IT"
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Ultima Modifica</Label>
                    <div className="mt-1 text-sm">
                      {new Date(selectedItem.updated_at).toLocaleString(
                        "it-IT"
                      )}
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
