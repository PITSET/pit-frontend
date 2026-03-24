import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export function useInstructors() {
  return useQuery({
    queryKey: ["instructors"],
    queryFn: async () => {
      const res = await api.get("/team-members");
      const members = res.data?.data?.data ?? res.data?.data ?? [];
      if (!Array.isArray(members)) {
        throw new Error("Unexpected API response shape for /team-members");
      }
      return members.filter((m) => m?.is_instructor);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}
