import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, LogOut, BarChart2, Users, TrendingUp, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAdminSessionFn, logoutAdminFn } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin")({
  // A sessão é checada no servidor (cookie HttpOnly assinado) antes de qualquer tela do admin.
  beforeLoad: async ({ location }) => {
    const { authed } = await getAdminSessionFn();
    if (!authed) {
      throw redirect({ to: "/admin-login", search: { redirect: location.href } });
    }
    if (location.pathname.replace(/\/$/, "") === "/admin") {
      throw redirect({ to: "/admin/metricas" });
    }
  },
  head: () => ({
    meta: [{ title: "Admin | Esolution" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/admin/metricas", label: "Métricas", icon: BarChart2 },
    { href: "/admin/leads", label: "Leads", icon: Users },
    { href: "/admin/conversao", label: "Conversão", icon: TrendingUp },
    { href: "/admin/propostas", label: "Propostas", icon: FileText },
  ];

  const handleLogout = async () => {
    await logoutAdminFn();
    window.location.href = "/admin-login";
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 [color-scheme:light]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 print:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Menu lateral"
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-green-700">Esolution Admin</h1>
          <button
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-1" role="navigation" aria-label="Navegação principal">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              activeProps={{ className: "bg-green-50 text-green-700" }}
              inactiveProps={{ className: "text-gray-600 hover:bg-gray-100 hover:text-gray-900" }}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 print:pl-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 px-4 bg-white border-b border-gray-200 lg:px-8 print:hidden">
          <button
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Painel Administrativo</h2>
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              Admin
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 print:p-0" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
