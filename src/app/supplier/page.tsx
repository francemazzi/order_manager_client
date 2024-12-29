"use client";

import { LayoutWithNav } from "../layout-with-nav";
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  type CreateCompanyDTO,
  type UpdateCompanyDTO,
} from "@/hooks/use-companies";
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
import { EditableCell } from "@/components/ui/editable-cell";

export default function SupplierPage() {
  const { data: companies, isLoading, error } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<UpdateCompanyDTO>({});
  const [formData, setFormData] = useState<CreateCompanyDTO>({
    name: "",
    vat_number: "",
    email: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare i fornitori",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCompany.mutateAsync(formData);
      toast({
        title: "Successo",
        description: "Fornitore creato con successo",
      });
      setOpen(false);
      setFormData({
        name: "",
        vat_number: "",
        email: "",
        address: "",
        phone: "",
      });
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile creare il fornitore",
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
      await updateCompany.mutateAsync({ id, data: editedData });
      toast({
        title: "Successo",
        description: "Fornitore aggiornato con successo",
      });
      setEditingId(null);
      setEditedData({});
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il fornitore",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCompany.mutateAsync(id);
      toast({
        title: "Successo",
        description: "Fornitore eliminato con successo",
      });
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il fornitore",
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
          Gestione Fornitori
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold dark:text-white">
                Lista Fornitori
              </h2>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nuovo Fornitore
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crea Nuovo Fornitore</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Azienda</Label>
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
                      <Label htmlFor="vat_number">Partita IVA</Label>
                      <Input
                        id="vat_number"
                        value={formData.vat_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vat_number: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Indirizzo</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefono</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
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
                      <Button type="submit" disabled={createCompany.isPending}>
                        {createCompany.isPending ? (
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
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Nome
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
                        P.IVA
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {companies?.map((company) => (
                      <tr
                        key={company.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <EditableCell
                            value={company.name}
                            isEditing={editingId === company.id}
                            onChange={(value) =>
                              setEditedData({ ...editedData, name: value })
                            }
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <EditableCell
                            value={company.email}
                            type="email"
                            isEditing={editingId === company.id}
                            onChange={(value) =>
                              setEditedData({ ...editedData, email: value })
                            }
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <EditableCell
                            value={company.phone}
                            isEditing={editingId === company.id}
                            onChange={(value) =>
                              setEditedData({ ...editedData, phone: value })
                            }
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <EditableCell
                            value={company.address}
                            isEditing={editingId === company.id}
                            onChange={(value) =>
                              setEditedData({ ...editedData, address: value })
                            }
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <EditableCell
                            value={company.vat_number}
                            isEditing={editingId === company.id}
                            onChange={(value) =>
                              setEditedData({
                                ...editedData,
                                vat_number: value,
                              })
                            }
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            {editingId === company.id ? (
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
                                  onClick={() => handleSave(company.id)}
                                  className="text-green-600 dark:text-green-400"
                                  disabled={updateCompany.isPending}
                                >
                                  {updateCompany.isPending ? (
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
                                  onClick={() => handleEdit(company.id)}
                                  className="text-blue-600 dark:text-blue-400"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(company.id)}
                                  className="text-red-600 dark:text-red-400"
                                  disabled={deleteCompany.isPending}
                                >
                                  {deleteCompany.isPending ? (
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
            )}
          </div>
        </div>
      </div>
    </LayoutWithNav>
  );
}
