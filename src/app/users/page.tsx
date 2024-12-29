"use client";

import { LayoutWithNav } from "../layout-with-nav";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  type CreateUserDTO,
  type UpdateUserDTO,
} from "@/hooks/use-users";
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

const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  SUPPLIER: "supplier",
  BASIC: "basic",
} as const;

type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export default function UsersPage() {
  const { data: users, isLoading, error } = useUsers();
  const { data: companies } = useCompanies();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<UpdateUserDTO>({});
  const [formData, setFormData] = useState<CreateUserDTO>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "basic",
    company_id: null,
    is_active: true,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare gli utenti",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser.mutateAsync(formData);
      toast({
        title: "Successo",
        description: "Utente creato con successo",
      });
      setOpen(false);
      setFormData({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "basic",
        company_id: null,
        is_active: true,
      });
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile creare l'utente",
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
      await updateUser.mutateAsync({ id, data: editedData });
      toast({
        title: "Successo",
        description: "Utente aggiornato con successo",
      });
      setEditingId(null);
      setEditedData({});
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'utente",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser.mutateAsync(id);
      toast({
        title: "Successo",
        description: "Utente eliminato con successo",
      });
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'utente",
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
        <h1 className="text-2xl font-bold dark:text-white">Gestione Utenti</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold dark:text-white">
                Lista Utenti
              </h2>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nuovo Utente
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crea Nuovo Utente</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Nome</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            first_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Cognome</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            last_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Ruolo</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value: UserRole) =>
                          setFormData({ ...formData, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona un ruolo" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(USER_ROLES).map(([key, value]) => (
                            <SelectItem key={value} value={value}>
                              {key}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Azienda</Label>
                      <Select
                        value={
                          formData.company_id
                            ? String(formData.company_id)
                            : "null"
                        }
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            company_id: value === "null" ? null : Number(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona un'azienda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="null">Lavora con noi</SelectItem>
                          {companies?.map((company) => (
                            <SelectItem
                              key={company.id}
                              value={String(company.id)}
                            >
                              {company.name}
                            </SelectItem>
                          ))}
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
                      <Button type="submit" disabled={createUser.isPending}>
                        {createUser.isPending ? (
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
                        Ruolo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Azienda
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Stato
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users?.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <EditableCellWithSelect
                              value={user.first_name}
                              isEditing={editingId === user.id}
                              onChange={(value) =>
                                setEditedData({
                                  ...editedData,
                                  first_name: value,
                                })
                              }
                            />
                            <EditableCellWithSelect
                              value={user.last_name}
                              isEditing={editingId === user.id}
                              onChange={(value) =>
                                setEditedData({
                                  ...editedData,
                                  last_name: value,
                                })
                              }
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <EditableCellWithSelect
                            value={user.email}
                            type="email"
                            isEditing={editingId === user.id}
                            onChange={(value) =>
                              setEditedData({ ...editedData, email: value })
                            }
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap uppercase">
                          <EditableCellWithSelect
                            value={user.role}
                            displayValue={
                              Object.entries(USER_ROLES).find(
                                (entry) => entry[1] === user.role
                              )?.[0]
                            }
                            isEditing={editingId === user.id}
                            isSelect
                            options={Object.entries(USER_ROLES).map(
                              ([key, value]) => ({
                                label: key,
                                value,
                              })
                            )}
                            onChange={(value) =>
                              setEditedData({
                                ...editedData,
                                role: value as UserRole,
                              })
                            }
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <EditableCellWithSelect
                            value={
                              user.company_id ? String(user.company_id) : "null"
                            }
                            displayValue={
                              user.company_id
                                ? companies?.find(
                                    (c) => c.id === user.company_id
                                  )?.name
                                : "Lavora con noi"
                            }
                            isEditing={editingId === user.id}
                            isSelect
                            options={[
                              { label: "Lavora con noi", value: "null" },
                              ...(companies?.map((company) => ({
                                label: company.name,
                                value: String(company.id),
                              })) || []),
                            ]}
                            onChange={(value) =>
                              setEditedData({
                                ...editedData,
                                company_id:
                                  value === "null" ? null : Number(value),
                              })
                            }
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.is_active
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {user.is_active ? "Attivo" : "Inattivo"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            {editingId === user.id ? (
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
                                  onClick={() => handleSave(user.id)}
                                  className="text-green-600 dark:text-green-400"
                                  disabled={updateUser.isPending}
                                >
                                  {updateUser.isPending ? (
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
                                  onClick={() => handleEdit(user.id)}
                                  className="text-blue-600 dark:text-blue-400"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(user.id)}
                                  className="text-red-600 dark:text-red-400"
                                  disabled={deleteUser.isPending}
                                >
                                  {deleteUser.isPending ? (
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
