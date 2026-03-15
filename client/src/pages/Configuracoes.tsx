import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Settings, LogOut, Menu, X, Save } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Configuracoes() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const [config, setConfig] = useState({
    systemPrompt: "Você é a assistente virtual da autoescola. Seu tom é amigável, prestativo e focado em fechar matrículas.",
    precoAulaTeoria: 50,
    precoAulaManobra: 75,
    precoAulaRua: 100,
    precoMatricula: 200,
  });

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/clientes", label: "Clientes", icon: Users },
    { href: "/configuracoes", label: "Configurações", icon: Settings },
  ];

  const isActive = (href: string) => location === href;

  const handleSave = async () => {
    setIsSaving(true);
    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert("Configurações salvas com sucesso!");
  };

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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 mb-8">Configurações da IA</h1>

            <div className="space-y-6">
              {/* System Prompt */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  System Prompt da IA
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  Configure o comportamento e personalidade da assistente de vendas
                </p>
                <textarea
                  value={config.systemPrompt}
                  onChange={(e) =>
                    setConfig({ ...config, systemPrompt: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite o system prompt para a IA..."
                />
              </div>

              {/* Preços */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Preços dos Serviços
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Aula de Teoria (R$)
                    </label>
                    <input
                      type="number"
                      value={config.precoAulaTeoria}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          precoAulaTeoria: parseFloat(e.target.value),
                        })
                      }
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Aula de Manobra (R$)
                    </label>
                    <input
                      type="number"
                      value={config.precoAulaManobra}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          precoAulaManobra: parseFloat(e.target.value),
                        })
                      }
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Aula de Rua (R$)
                    </label>
                    <input
                      type="number"
                      value={config.precoAulaRua}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          precoAulaRua: parseFloat(e.target.value),
                        })
                      }
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Matrícula (R$)
                    </label>
                    <input
                      type="number"
                      value={config.precoMatricula}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          precoMatricula: parseFloat(e.target.value),
                        })
                      }
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Save size={18} />
                  {isSaving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
