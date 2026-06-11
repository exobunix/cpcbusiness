import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isAuthenticated } from "@/lib/auth";

import HomePage from "@/pages/public/HomePage";
import ServicesPage from "@/pages/public/ServicesPage";
import PortfolioPage from "@/pages/public/PortfolioPage";
import AboutPage from "@/pages/public/AboutPage";
import ContactPage from "@/pages/public/ContactPage";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

import DashboardPage from "@/pages/admin/DashboardPage";
import LeadsPage from "@/pages/admin/LeadsPage";
import ClientsPage from "@/pages/admin/ClientsPage";
import ProjectsPage from "@/pages/admin/ProjectsPage";
import TasksPage from "@/pages/admin/TasksPage";
import TeamPage from "@/pages/admin/TeamPage";
import InvoicesPage from "@/pages/admin/InvoicesPage";
import TicketsPage from "@/pages/admin/TicketsPage";
import ServicesCMSPage from "@/pages/admin/ServicesCMSPage";
import PortfolioCMSPage from "@/pages/admin/PortfolioCMSPage";
import AIPage from "@/pages/admin/AIPage";
import MessagesPage from "@/pages/admin/MessagesPage";

import ClientDashboardPage from "@/pages/client/ClientDashboardPage";
import ClientProjectsPage from "@/pages/client/ClientProjectsPage";
import ClientInvoicesPage from "@/pages/client/ClientInvoicesPage";
import ClientTicketsPage from "@/pages/client/ClientTicketsPage";
import ClientMessagesPage from "@/pages/client/ClientMessagesPage";
import ClientNotificationsPage from "@/pages/client/ClientNotificationsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [location] = useLocation();
  if (!isAuthenticated()) {
    return <Redirect to="/login" />;
  }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={HomePage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/portfolio" component={PortfolioPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />

      {/* Auth */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      {/* Admin */}
      <Route path="/admin">
        {() => <ProtectedRoute component={DashboardPage} />}
      </Route>
      <Route path="/admin/leads">
        {() => <ProtectedRoute component={LeadsPage} />}
      </Route>
      <Route path="/admin/clients">
        {() => <ProtectedRoute component={ClientsPage} />}
      </Route>
      <Route path="/admin/projects">
        {() => <ProtectedRoute component={ProjectsPage} />}
      </Route>
      <Route path="/admin/tasks">
        {() => <ProtectedRoute component={TasksPage} />}
      </Route>
      <Route path="/admin/team">
        {() => <ProtectedRoute component={TeamPage} />}
      </Route>
      <Route path="/admin/invoices">
        {() => <ProtectedRoute component={InvoicesPage} />}
      </Route>
      <Route path="/admin/tickets">
        {() => <ProtectedRoute component={TicketsPage} />}
      </Route>
      <Route path="/admin/services">
        {() => <ProtectedRoute component={ServicesCMSPage} />}
      </Route>
      <Route path="/admin/portfolio">
        {() => <ProtectedRoute component={PortfolioCMSPage} />}
      </Route>
      <Route path="/admin/ai">
        {() => <ProtectedRoute component={AIPage} />}
      </Route>
      <Route path="/admin/messages">
        {() => <ProtectedRoute component={MessagesPage} />}
      </Route>

      {/* Client Portal */}
      <Route path="/client">
        {() => <ProtectedRoute component={ClientDashboardPage} />}
      </Route>
      <Route path="/client/projects">
        {() => <ProtectedRoute component={ClientProjectsPage} />}
      </Route>
      <Route path="/client/invoices">
        {() => <ProtectedRoute component={ClientInvoicesPage} />}
      </Route>
      <Route path="/client/tickets">
        {() => <ProtectedRoute component={ClientTicketsPage} />}
      </Route>
      <Route path="/client/messages">
        {() => <ProtectedRoute component={ClientMessagesPage} />}
      </Route>
      <Route path="/client/notifications">
        {() => <ProtectedRoute component={ClientNotificationsPage} />}
      </Route>

      {/* 404 */}
      <Route>
        {() => (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <p className="text-8xl font-black gradient-text mb-4">404</p>
              <p className="text-white font-bold text-xl mb-2">Page Not Found</p>
              <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
              <a href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors text-sm">
                Go Home
              </a>
            </div>
          </div>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
