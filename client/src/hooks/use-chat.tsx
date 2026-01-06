import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { InsertMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useChatMessages(unitId: number) {
  return useQuery({
    queryKey: [api.chat.list.path, unitId],
    queryFn: async () => {
      const url = buildUrl(api.chat.list.path, { unitId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.chat.list.responses[200].parse(await res.json());
    },
    refetchInterval: 3000, // Polling every 3s
  });
}

export function useSendMessage(unitId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertMessage) => {
      const url = buildUrl(api.chat.send.path, { unitId });
      const res = await fetch(url, {
        method: api.chat.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.chat.send.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chat.list.path, unitId] });
    },
    onError: () => {
      toast({ title: "خطا", description: "پیام ارسال نشد", variant: "destructive" });
    }
  });
}
