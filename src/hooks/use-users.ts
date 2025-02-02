import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company_id: number | null;
  role: "admin" | "manager" | "supplier" | "basic";
  is_active: boolean;
};

export type CreateUserDTO = Omit<User, "id"> & {
  password: string;
};

export type UpdateUserDTO = Partial<CreateUserDTO>;

const USERS_QUERY_KEY = "users";

export function useUsers() {
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useQuery({
    queryKey: [USERS_QUERY_KEY],
    queryFn: async () => {
      const response = await fetch(`${urlPy}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json() as Promise<User[]>;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useMutation({
    mutationFn: async (data: CreateUserDTO) => {
      console.log("Sending data to server:", data);
      const response = await fetch(`${urlPy}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
          company_id: Number(data.company_id),
          is_active: data.is_active,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Server error:", errorData);
        throw new Error("Failed to create user");
      }
      const responseData = await response.json();
      console.log("Server response:", responseData);
      return responseData as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUserDTO }) => {
      const response = await fetch(`${urlPy}/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update user");
      }
      return response.json() as Promise<User>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const urlPy = process.env.NEXT_PUBLIC_URL_PY;
  if (!urlPy) {
    throw new Error("NEXT_PUBLIC_URL_PY is not defined");
  }

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${urlPy}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
  });
}
