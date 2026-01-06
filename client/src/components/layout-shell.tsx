import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Users, CreditCard, MessageCircle, Settings, Menu } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  if (!user) return <>{children}</>;

  const superAdminLinks = [
    { href: "/super/dashboard", label: "داشبورد اصلی", icon: Home },
    { href: "/super/admins", label: "مدیران ساختمان", icon: Users },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "داشبورد", icon: Home },
    { href: "/admin/units", label: "مدیریت واحدها", icon: Settings },
    { href: "/admin/payments", label: "مدیریت پرداخت‌ها", icon: CreditCard },
    { href: "/admin/chat", label: "پیام‌ها", icon: MessageCircle },
  ];

  const residentLinks = [
    { href: "/resident/dashboard", label: "واحد من", icon: Home },
    { href: "/resident/payments", label: "پرداخت‌های من", icon: CreditCard },
    { href: "/resident/chat", label: "ارتباط با مدیر", icon: MessageCircle },
  ];

  let links = [];
  if (user.role === "super_admin") links = superAdminLinks;
  else if (user.role === "building_admin") links = adminLinks;
  else links = residentLinks;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-xl border-l border-border/50">
      <div className="p-6 border-b border-border/10">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
          سامانه مدیریت
        </h1>
        <p className="text-sm text-muted-foreground mt-1">ساختمان هوشمند</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-primary/10 text-primary font-medium shadow-sm" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )} onClick={() => setOpen(false)}>
              <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/10">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-muted/30 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-xs">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate opacity-70">
              {user.role === "super_admin" ? "مدیر کل" : user.role === "building_admin" ? "مدیر ساختمان" : "ساکن"}
            </p>
          </div>
        </div>
        <Button 
          variant="destructive" 
          className="w-full justify-start gap-2 rounded-xl"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="w-4 h-4" />
          خروج از حساب
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex rtl">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/20 p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary">مدیریت ساختمان</h1>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-80 border-l border-border/20">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
