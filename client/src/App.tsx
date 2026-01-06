import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import SuperAdminDashboard from "@/pages/super-admin/dashboard";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUnitsPage from "@/pages/admin/units";
import ResidentDashboard from "@/pages/resident/dashboard";
import ChatPage from "@/pages/chat";

// --- Protected Routes ---

function ProtectedRoute({ component: Component, allowedRoles }: { component: any, allowedRoles: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Redirect to="/login" />; // Or unauthorized page
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      {/* Default redirect based on context is hard in wouter without user state, handled inside Login page effect */}
      <Route path="/">
         {/* Redirect to login initially, specific dashboards will capture authenticated users */}
         <Redirect to="/login" />
      </Route>

      {/* Super Admin */}
      <Route path="/super/dashboard">
        <ProtectedRoute component={SuperAdminDashboard} allowedRoles={['super_admin']} />
      </Route>

      {/* Building Admin */}
      <Route path="/admin/dashboard">
        <ProtectedRoute component={AdminDashboard} allowedRoles={['building_admin']} />
      </Route>
      <Route path="/admin/units">
        <ProtectedRoute component={AdminUnitsPage} allowedRoles={['building_admin']} />
      </Route>
      <Route path="/admin/payments">
        {/* Reuse dashboard for now or build separate if needed, simplified for this prompt */}
        <ProtectedRoute component={AdminDashboard} allowedRoles={['building_admin']} />
      </Route>
      <Route path="/admin/chat">
        <ProtectedRoute component={ChatPage} allowedRoles={['building_admin']} />
      </Route>

      {/* Resident */}
      <Route path="/resident/dashboard">
        <ProtectedRoute component={ResidentDashboard} allowedRoles={['resident']} />
      </Route>
      <Route path="/resident/payments">
        <ProtectedRoute component={ResidentDashboard} allowedRoles={['resident']} />
      </Route>
      <Route path="/resident/chat">
        <ProtectedRoute component={ChatPage} allowedRoles={['resident']} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LayoutShell>
          <Router />
        </LayoutShell>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
