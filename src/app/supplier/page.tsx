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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COMPANY_TAGS = {
  BUYER: "buyer",
  SUPPLIER: "supplier",
  CUSTOMER: "customer",
  NULL: null,
  NONE: "none",
} as const;

export default function SupplierPage() {
  const { data: companies, isLoading, error } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<UpdateCompanyDTO>({});
  const [selectedTag, setSelectedTag] = useState<string | null>(
    COMPANY_TAGS.SUPPLIER
  );
  const [formData, setFormData] = useState<CreateCompanyDTO>({
    name: "",
    vat_number: "",
    email: "",
    address: "",
    phone: "",
    tag: "",
  });

  const filteredCompanies = companies?.filter((company) =>
    selectedTag === COMPANY_TAGS.NONE ? true : company.tag === selectedTag
  );

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
      if (!formData.tag) {
        toast({
          title: "Errore",
          description: "Seleziona un tipo di azienda",
          variant: "destructive",
        });
        return;
      }

      console.log("Submitting form data:", formData);

      const dataToSubmit = {
        ...formData,
        tag: formData.tag.toUpperCase(),
      };

      await createCompany.mutateAsync(dataToSubmit);
      toast({
        title: "Successo",
        description: "Azienda creata con successo",
      });
      setOpen(false);
      setSelectedTag(formData.tag);
      const selectedTag = formData.tag;
      setFormData({
        name: "",
        vat_number: "",
        email: "",
        address: "",
        phone: "",
        tag: selectedTag,
      });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string" &&
        error.message.includes(
          'duplicate key value violates unique constraint "companies_vat_number_key"'
        )
      ) {
        toast({
          title: "Errore",
          description: "Esiste già un'azienda con questa partita IVA",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Errore",
          description: "Impossibile creare l'azienda",
          variant: "destructive",
        });
      }
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

  const getDisplayTag = (tag: string | null) => {
    switch (tag) {
      case COMPANY_TAGS.BUYER:
        return "Acquirente";
      case COMPANY_TAGS.SUPPLIER:
        return "Fornitore";
      case COMPANY_TAGS.CUSTOMER:
        return "Cliente";
      case COMPANY_TAGS.NULL:
        return "Senza tag";
      default:
        return "Nessuno";
    }
  };

  return (
    <LayoutWithNav>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white">
            Gestione Aziende
          </h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuova azienda
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crea Nuova Azienda</DialogTitle>
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
                <div className="space-y-2">
                  <Label>Tipo Azienda</Label>
                  <Select
                    value={formData.tag}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tag: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={COMPANY_TAGS.SUPPLIER}>
                        Fornitore
                      </SelectItem>
                      <SelectItem value={COMPANY_TAGS.CUSTOMER}>
                        Cliente
                      </SelectItem>
                      <SelectItem value={COMPANY_TAGS.BUYER}>
                        Acquirente
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                    disabled={createCompany.isPending || !formData.tag}
                  >
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold dark:text-white">
                  Lista Aziende
                </h2>
                <Select
                  value={selectedTag || COMPANY_TAGS.NONE}
                  onValueChange={(value) => setSelectedTag(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtra per tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={COMPANY_TAGS.SUPPLIER}>
                      Fornitori
                    </SelectItem>
                    <SelectItem value={COMPANY_TAGS.CUSTOMER}>
                      Clienti
                    </SelectItem>
                    <SelectItem value={COMPANY_TAGS.BUYER}>
                      Acquirenti
                    </SelectItem>
                    <SelectItem value={COMPANY_TAGS.NULL}>Senza tag</SelectItem>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCompanies?.map((company) => (
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
                        <td
                          className="px-4 py-4 whitespace-nowrap cursor-pointer"
                          onClick={() => handleEdit(company.id)}
                        >
                          {editingId === company.id ? (
                            <div className="flex items-center gap-2">
                              <Select
                                value={company.tag || COMPANY_TAGS.NONE}
                                onValueChange={(value) =>
                                  setEditedData({
                                    ...editedData,
                                    tag:
                                      value === COMPANY_TAGS.NONE ? "" : value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={COMPANY_TAGS.NONE}>
                                    Nessuno
                                  </SelectItem>
                                  <SelectItem value={COMPANY_TAGS.SUPPLIER}>
                                    Fornitore
                                  </SelectItem>
                                  <SelectItem value={COMPANY_TAGS.CUSTOMER}>
                                    Cliente
                                  </SelectItem>
                                  <SelectItem value={COMPANY_TAGS.BUYER}>
                                    Acquirente
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            getDisplayTag(company.tag)
                          )}
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
