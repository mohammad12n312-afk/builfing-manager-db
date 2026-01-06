import { useCreateAdmin } from "@/hooks/use-building.tsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAdminSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, UserPlus } from "lucide-react";

export default function SuperAdminDashboard() {
  const createAdminMutation = useCreateAdmin();

  const form = useForm<z.infer<typeof createAdminSchema>>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      role: "building_admin",
    },
  });

  const onSubmit = (data: z.infer<typeof createAdminSchema>) => {
    createAdminMutation.mutate(data, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">داشبورد مدیر کل</h1>
        <p className="text-muted-foreground mt-2">مدیریت مدیران ساختمان و دسترسی‌ها</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">وضعیت سیستم</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">فعال</div>
            <p className="text-xs text-muted-foreground mt-1">همه سرویس‌ها آنلاین هستند</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>تعریف مدیر ساختمان جدید</CardTitle>
              <CardDescription>یک حساب کاربری برای مدیر ساختمان ایجاد کنید</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام و نام خانوادگی</FormLabel>
                    <FormControl>
                      <Input placeholder="علی محمدی" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام کاربری</FormLabel>
                    <FormControl>
                      <Input placeholder="admin1" className="rounded-xl" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="rounded-xl" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full rounded-xl"
                disabled={createAdminMutation.isPending}
              >
                {createAdminMutation.isPending ? "در حال ایجاد..." : "ایجاد مدیر"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
