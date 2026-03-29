import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export function useAbout(options = {}) {
  return useQuery({
    queryKey: ["about"],
    queryFn: async () => {
      const res = await api.get("/about");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      return data.filter((item) => item?.is_active === true);
    },
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}
