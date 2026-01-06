import { useAuth } from "@/hooks/use-auth";
import { usePayments } from "@/hooks/use-building";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, DollarSign, Clock } from "lucide-react";

export default function ResidentDashboard() {
  const { user } = useAuth();
  // In a real app we'd filter payments by user.id on the backend
  // Here we'll just fetch all and filter client side for demo since API is simple
  const { data: payments } = usePayments();
  
  const myPayments = payments?.filter(p => p.unitId === user?.unitId) || [];
  const pending = myPayments.filter(p => p.status === 'pending');
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">خوش آمدید، {user?.name}</h1>
        <p className="text-muted-foreground mt-2">پنل مدیریت واحد مسکونی</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">واحد شما</CardTitle>
            <Home className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">واحد {user?.unitId}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">بدهی جاری</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {pending.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} تومان
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>صورت‌حساب‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myPayments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-xl">
                 <div>
                    <p className="font-bold">{payment.description || "شارژ ماهیانه"}</p>
                    <p className="text-sm text-muted-foreground">{payment.period}</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="font-mono text-lg">{payment.amount.toLocaleString()}</span>
                    <Badge variant={payment.status === 'paid' ? 'default' : 'destructive'}>
                      {payment.status === 'paid' ? 'پرداخت شده' : 'پرداخت نشده'}
                    </Badge>
                 </div>
              </div>
            ))}
            {myPayments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">موردی یافت نشد</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
