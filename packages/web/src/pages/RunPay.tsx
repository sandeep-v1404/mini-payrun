import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

type Payrun = {
  id: string;
  periodStart: string;
  periodEnd: string;
  totals: {
    gross: number;
    tax: number;
    super: number;
    net: number;
  };
};

export default function Payruns() {
  const queryClient = useQueryClient();

  const { data: payruns, isLoading } = useQuery({
    queryKey: ["payruns"],
    queryFn: async () => {
      const res = await api.get<Payrun[]>("/payruns");
      return res.data;
    },
  });

  const createPayrun = useMutation({
    mutationFn: () =>
      api.post("/payruns", {
        periodStart: "2025-09-01",
        periodEnd: "2025-09-15",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payruns"] }),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">Payruns</h1>
      <button
        onClick={() => createPayrun.mutate()}
        className="bg-green-500 text-white px-3 py-1 mb-3"
      >
        Generate Payrun
      </button>

      <ul>
        {payruns?.map((p) => (
          <li key={p.id}>
            {p.periodStart} → {p.periodEnd} | Net: {p.totals.net}
          </li>
        ))}
      </ul>
    </div>
  );
}
