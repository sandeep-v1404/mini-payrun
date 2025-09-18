import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { Payrun, PayrunRequest } from "@mini-payrun/shared";

// Fetch payruns
export const usePayruns = () =>
  useQuery<Payrun[]>({
    queryKey: ["payruns"],
    queryFn: async () => {
      const res = await api.get<Payrun[]>("/payruns");
      return res.data;
    },
  });

// Run pay
export const useRunPay = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: PayrunRequest) => {
      const res = await api.post<Payrun>("/payruns", req);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payruns"] }),
  });
};

// Fetch single payrun
export const usePayrunWithId = (id: string) =>
  useQuery<Payrun>({
    queryKey: ["payruns", id],
    queryFn: async () => {
      const res = await api.get<Payrun>(`/payruns/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
