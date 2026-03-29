import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export function useProjects(options = {}) {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.get("/projects");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.projects || [];
      return data
        .filter((item) => item?.is_active !== false)
        .sort((a, b) => (Number(a?.order_position) || 0) - (Number(b?.order_position) || 0));
    },
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}
