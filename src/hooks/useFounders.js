import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export function useFounders() {
  return useQuery({
    queryKey: ["founders"],
    queryFn: async () => {
      try {
        const res = await api.get("/team-members/founders");
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        return data;
      } catch (err) {
        return [];
      }
    },
    staleTime: 1000 * 60 * 10,
  });
}
