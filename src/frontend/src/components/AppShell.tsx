import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "@tanstack/react-router";
import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  User,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import type { backendInterface } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { DayStatusBadge } from "./DayStatusBadge";

interface AppShellProps {
  children: ReactNode;
  pageTitle: string;
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/fees", icon: IndianRupee, label: "Fee Collection" },
  { to: "/expenses", icon: Receipt, label: "Expenses" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { actor } = useActor();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    try {
      if (actor) {
        const typedActor = actor as unknown as backendInterface;
        await typedActor.logout();
      }
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem("schoolAdminLoggedIn");
    navigate({ to: "/login" });
    onNavigate?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* School branding */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
            <img
              src="/assets/generated/school-logo-transparent.dim_120x120.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-xs leading-tight truncate">
              LITTLE STAR H. S. SCHOOL
            </p>
            <p className="text-blue-200/70 text-xs tracking-wider">TENGAKHAT</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive =
            to === "/" ? currentPath === "/" : currentPath.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              data-ocid={`nav.${label.toLowerCase().replace(" ", "_")}.link`}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "text-white"
                  : "text-blue-200/80 hover:text-white hover:bg-white/10"
              }`}
              style={isActive ? { background: "#0F2F60" } : {}}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        <Button
          variant="ghost"
          data-ocid="nav.logout.button"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-red-300/80 hover:text-red-200 hover:bg-red-500/10 text-sm font-medium"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export default function AppShell({ children, pageTitle }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = localStorage.getItem("schoolAdminLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 flex-shrink-0"
        style={{
          background: "linear-gradient(180deg, #163A73 0%, #1B4585 100%)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-60 p-0 border-0"
          style={{
            background: "linear-gradient(180deg, #163A73 0%, #1B4585 100%)",
          }}
        >
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-ocid="nav.menu.button"
                  className="md:hidden h-9 w-9"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <h1 className="text-lg font-bold text-foreground">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <DayStatusBadge />
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium">Admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
