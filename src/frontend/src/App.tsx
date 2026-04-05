import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AppShell from "./components/AppShell";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import FeeCollectionPage from "./pages/FeeCollectionPage";
import LoginPage from "./pages/LoginPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

// Index redirect
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    const isLoggedIn = localStorage.getItem("schoolAdminLoggedIn") === "true";
    if (!isLoggedIn) return <Navigate to="/login" />;
    return (
      <AppShell pageTitle="Dashboard">
        <DashboardPage />
      </AppShell>
    );
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const feesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fees",
  component: () => (
    <AppShell pageTitle="Fee Collection">
      <FeeCollectionPage />
    </AppShell>
  ),
});

const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/expenses",
  component: () => (
    <AppShell pageTitle="Expenses">
      <ExpensesPage />
    </AppShell>
  ),
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: () => (
    <AppShell pageTitle="Reports">
      <ReportsPage />
    </AppShell>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => (
    <AppShell pageTitle="Settings">
      <SettingsPage />
    </AppShell>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  feesRoute,
  expensesRoute,
  reportsRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
