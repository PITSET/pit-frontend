import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export function useHome(options = {}) {
  return useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const res = await api.get("/home");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.home || [];
      return data.filter((item) => item?.is_active === true).sort(
        (a, b) => (Number(a?.order_position) || 0) - (Number(b?.order_position) || 0)
      );
    },
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}
