import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { InsertUnit, InsertPayment, InsertUser, createResidentSchema, createAdminSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// --- UNITS ---

export function useUnits() {
  return useQuery({
    queryKey: [api.units.list.path],
    queryFn: async () => {
      const res = await fetch(api.units.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch units");
      return api.units.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertUnit) => {
      const res = await fetch(api.units.create.path, {
        method: api.units.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create unit");
      return api.units.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.units.list.path] });
      toast({ title: "موفق", description: "واحد جدید با موفقیت ایجاد شد" });
    },
    onError: (err) => {
      toast({ title: "خطا", description: err.message, variant: "destructive" });
    }
  });
}

// --- PAYMENTS ---

export function usePayments() {
  return useQuery({
    queryKey: [api.payments.list.path],
    queryFn: async () => {
      const res = await fetch(api.payments.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch payments");
      return api.payments.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertPayment) => {
      const res = await fetch(api.payments.create.path, {
        method: api.payments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to record payment");
      return api.payments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.payments.list.path] });
      toast({ title: "موفق", description: "پرداخت با موفقیت ثبت شد" });
    },
    onError: (err) => {
      toast({ title: "خطا", description: err.message, variant: "destructive" });
    }
  });
}

// --- USERS (ADMINS & RESIDENTS) ---

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof createAdminSchema>) => {
      const res = await fetch(api.auth.createAdmin.path, {
        method: api.auth.createAdmin.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create admin");
      return api.auth.createAdmin.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "موفق", description: "مدیر ساختمان ایجاد شد" });
    },
    onError: (err) => {
      toast({ title: "خطا", description: err.message, variant: "destructive" });
    }
  });
}

export function useCreateResident() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: z.infer<typeof createResidentSchema>) => {
      const res = await fetch(api.auth.createResident.path, {
        method: api.auth.createResident.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create resident");
      return api.auth.createResident.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate units to show assigned resident? 
      queryClient.invalidateQueries({ queryKey: [api.units.list.path] });
      toast({ title: "موفق", description: "ساکن جدید اضافه شد" });
    },
    onError: (err) => {
      toast({ title: "خطا", description: err.message, variant: "destructive" });
    }
  });
}
