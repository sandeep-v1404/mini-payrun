import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { Employee } from "@mini-payrun/shared";

// Fetch all employees
export const useEmployees = () =>
  useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await api.get<Employee[]>("/employees");
      return res.data;
    },
  });

// Create/update employee
export const useUpsertEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (emp: Employee) => {
      const res = await api.post<Employee>("/employees", emp);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};
