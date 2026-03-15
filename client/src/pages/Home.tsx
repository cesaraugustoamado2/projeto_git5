import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { MessageSquare, TrendingUp, Users, Zap, CheckCircle2, ArrowRight, BarChart3, Smartphone } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center font-bold">
              A
            </div>
            <span className="text-xl font-bold">Autoescola SaaS</span>
          </div>
          <div>
            {isAuthenticated ? (
              <Button variant="outline" asChild>
                <a href="/dashboard">Dashboard</a>
              </Button>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Entrar</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Automatize suas vendas com <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">IA Vendedora</span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Plataforma SaaS completa para gerenciar autoescolas. Integre IA vendedora ao WhatsApp e converta interessados em alunos automaticamente.
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <a href={getLoginUrl()}>Começar Agora</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#features">Ver Recursos</a>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <span className="text-sm">Mensagem recebida via WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm">IA analisa e responde</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-sm">Venda registrada no dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Recursos Poderosos</h2>
            <p className="text-xl text-slate-300">Tudo que você precisa para gerenciar sua autoescola</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-8 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">WhatsApp Integration</h3>
              <p className="text-slate-300">Integração com WhatsApp Cloud API para atendimento 24/7 automatizado</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-8 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">IA Vendedora</h3>
              <p className="text-slate-300">GPT-4o-mini com function calling para detectar vendas automaticamente</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-8 hover:border-green-500/50 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Dashboard Analytics</h3>
              <p className="text-slate-300">Métricas de vendas em tempo real e gestão de clientes</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-8 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-tenant</h3>
              <p className="text-slate-300">Suporte para múltiplas autoescolas com isolamento total de dados</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-8 hover:border-orange-500/50 transition-colors">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Segurança</h3>
              <p className="text-slate-300">Autenticação OAuth, JWT e isolamento multi-tenant garantido</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-8 hover:border-red-500/50 transition-colors">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Escalável</h3>
              <p className="text-slate-300">Arquitetura robusta com Redis, BullMQ e PostgreSQL</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">Como Funciona</h2>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Cliente envia mensagem", desc: "Via WhatsApp" },
              { step: "2", title: "IA processa", desc: "GPT-4o-mini analisa" },
              { step: "3", title: "Resposta automática", desc: "Enviada ao cliente" },
              { step: "4", title: "Venda registrada", desc: "No dashboard" },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center font-bold text-slate-900 mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto para transformar sua autoescola?</h2>
          <p className="text-xl mb-8 opacity-90">
            Comece agora e veja o impacto na sua taxa de conversão
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href={getLoginUrl()}>Acessar Dashboard</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <p>&copy; 2026 Autoescola SaaS. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
