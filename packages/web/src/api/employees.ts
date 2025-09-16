import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { api } from "./client";
import type { Employee } from "@mini-payrun/shared";

/**
 * Fetch all employees
 */
export const useEmployees = (
  options?: Partial<UseQueryOptions<Employee[], Error>>
) => {
  return useQuery<Employee[], Error>({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await api.get<Employee[]>("/employees");
      return res.data;
    },
    ...(options ?? {}),
  });
};

/**
 * Create new employee
 */
export const useCreateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (emp: Employee) => {
      const res = await api.post<Employee>("/employees", emp);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};

/**
 * Update existing employee
 */
export const useUpdateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (emp: Employee) => {
      if (!emp.id) throw new Error("Employee id is required for update");
      const res = await api.put<Employee>(`/employees/${emp.id}`, emp);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};

/**
 * Delete employee
 */
export const useDeleteEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/employees/${id}`);
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};
