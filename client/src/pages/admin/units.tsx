import { useUnits, useCreateUnit, useCreateResident } from "@/hooks/use-building";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUnitSchema, createResidentSchema, type InsertUnit } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { useState } from "react";

export default function AdminUnitsPage() {
  const { data: units, isLoading } = useUnits();
  
  if (isLoading) return <div>لطفا صبر کنید...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مدیریت واحدها</h1>
          <p className="text-muted-foreground mt-2">لیست واحدها و تعریف ساکنین</p>
        </div>
        <AddUnitDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units?.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </div>
    </div>
  );
}

function UnitCard({ unit }: { unit: any }) {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-all group">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-xl group-hover:scale-110 transition-transform">
            {unit.unitNumber}
          </div>
          <Badge variant={unit.status === 'active' ? 'default' : 'secondary'} className="rounded-md">
            {unit.status === 'active' ? 'فعال' : 'خالی'}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">طبقه:</span>
            <span className="font-medium">{unit.floor}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ساکن:</span>
            {unit.residentId ? (
              <span className="font-medium text-green-600">دارد</span>
            ) : (
              <AddResidentDialog unitId={unit.id} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AddUnitDialog() {
  const [open, setOpen] = useState(false);
  const createUnit = useCreateUnit();
  
  const form = useForm<InsertUnit>({
    resolver: zodResolver(insertUnitSchema),
    defaultValues: {
      unitNumber: "",
      floor: 1,
      status: "active"
    }
  });

  const onSubmit = (data: InsertUnit) => {
    createUnit.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          افزودن واحد
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعریف واحد جدید</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="unitNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>شماره واحد</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="floor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>طبقه</FormLabel>
                  <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={createUnit.isPending}>
              ثبت واحد
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function AddResidentDialog({ unitId }: { unitId: number }) {
  const [open, setOpen] = useState(false);
  const createResident = useCreateResident();
  
  const form = useForm<z.infer<typeof createResidentSchema>>({
    resolver: zodResolver(createResidentSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      role: "resident",
      unitId: unitId
    }
  });

  const onSubmit = (data: any) => {
    createResident.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
          <UserPlus className="w-3 h-3" />
          افزودن ساکن
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعریف ساکن جدید</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام و نام خانوادگی</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
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
                  <FormControl><Input {...field} /></FormControl>
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
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={createResident.isPending}>
              ثبت ساکن
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
