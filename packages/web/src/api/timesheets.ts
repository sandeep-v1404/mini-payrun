import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { Timesheet } from "@mini-payrun/shared";

// Fetch timesheets
export const useTimesheets = () =>
  useQuery<Timesheet[]>({
    queryKey: ["timesheets"],
    queryFn: async () => {
      const res = await api.get<Timesheet[]>("/timesheets");
      return res.data;
    },
  });

// Create/update timesheet
export const useUpsertTimesheet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ts: Timesheet) => {
      const res = await api.post<Timesheet>("/timesheets", ts);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timesheets"] }),
  });
};
