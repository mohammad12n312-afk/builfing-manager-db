import { useUnits, usePayments } from "@/hooks/use-building";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns-jalali";

export default function AdminDashboard() {
  const { data: units, isLoading: unitsLoading } = useUnits();
  const { data: payments, isLoading: paymentsLoading } = usePayments();

  if (unitsLoading || paymentsLoading) return <div>در حال بارگذاری...</div>;

  const totalUnits = units?.length || 0;
  const occupiedUnits = units?.filter(u => u.status === 'active').length || 0;
  
  // Simple logic to find unpaid bills
  const pendingPayments = payments?.filter(p => p.status === 'pending') || [];
  const totalDebt = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">نمای کلی ساختمان</h1>
        <p className="text-muted-foreground mt-2">گزارش وضعیت واحدها و دریافتی‌ها</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="کل واحدها" 
          value={totalUnits} 
          icon={Building} 
          className="bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400"
        />
        <StatsCard 
          title="واحدهای فعال" 
          value={occupiedUnits} 
          icon={Users}
          className="bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400"
        />
        <StatsCard 
          title="پرداخت‌های معوق" 
          value={pendingPayments.length} 
          icon={AlertCircle}
          className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400"
        />
        <StatsCard 
          title="جمع بدهی‌ها" 
          value={`${totalDebt.toLocaleString()} تومان`} 
          icon={CheckCircle2}
          className="bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>آخرین پرداخت‌های دریافتی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments?.filter(p => p.status === 'paid').slice(0, 5).map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">واحد {payment.unitId}</p>
                      <p className="text-xs text-muted-foreground">{payment.period}</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">{payment.amount.toLocaleString()} تومان</span>
                </div>
              ))}
              {(!payments || payments.length === 0) && (
                <p className="text-center text-muted-foreground py-8">هیچ پرداختی ثبت نشده است</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>بدهکاران</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {pendingPayments.slice(0, 5).map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">واحد {payment.unitId}</p>
                      <p className="text-xs text-muted-foreground">{payment.description || "شارژ ماهیانه"}</p>
                    </div>
                  </div>
                  <span className="font-bold text-red-600">{payment.amount.toLocaleString()} تومان</span>
                </div>
              ))}
               {pendingPayments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">هیچ بدهی ثبت نشده است</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, className }: any) {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
          </div>
          <div className={`p-3 rounded-xl ${className}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
