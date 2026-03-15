import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/clientes", label: "Clientes", icon: Users },
    { href: "/configuracoes", label: "Configurações", icon: Settings },
  ];

  const isActive = (href: string) => location === href;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-slate-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold">Autoescola</h1>
          <p className="text-sm text-slate-400">Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="mb-4 pb-4 border-b border-slate-700">
            <p className="text-sm text-slate-400">Logado como</p>
            <p className="font-semibold truncate">{user?.name}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
          >
            <LogOut size={18} />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="text-sm text-slate-600">
            Bem-vindo, <span className="font-semibold">{user?.name}</span>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 mb-8">Dashboard</h1>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { title: "Total de Clientes", value: "0", color: "bg-blue-500" },
                { title: "Total de Vendas", value: "0", color: "bg-green-500" },
                { title: "Conversas Ativas", value: "0", color: "bg-purple-500" },
                { title: "Vendas Hoje", value: "R$ 0,00", color: "bg-orange-500" },
              ].map((card, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">{card.title}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">
                        {card.value}
                      </p>
                    </div>
                    <div className={`${card.color} w-12 h-12 rounded-lg`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Atividade Recente
              </h2>
              <div className="text-center py-8 text-slate-500">
                <p>Nenhuma atividade recente para exibir</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
