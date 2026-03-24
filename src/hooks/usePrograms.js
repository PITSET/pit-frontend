import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export function usePrograms() {
  return useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const res = await api.get("/programs");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      return data.filter((p) => p.is_active !== false);
    },
    // Keep data fresh for 10 minutes (matching main.jsx config)
    staleTime: 1000 * 60 * 10,
  });
}
