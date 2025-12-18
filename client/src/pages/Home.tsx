import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Fuel,
  TrendingUp,
  Users,
  Lock,
  Zap,
  BarChart3,
  CreditCard,
  Bell,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-padding relative overflow-hidden">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                    Gestão de Frotas e Postos{" "}
                    <span className="gradient-text">Simplificada</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground max-w-md">
                    Conecte postos, frotas e famílias em uma única plataforma.
                    Controle de abastecimento, pagamentos e relatórios em tempo
                    real.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={getLoginUrl()}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    Começar Agora
                    <ArrowRight className="h-5 w-5" />
                  </a>
                  <button className="btn-secondary">
                    Ver Demonstração
                  </button>
                </div>

                <div className="flex gap-8 pt-4 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">500+</p>
                    <p className="text-muted-foreground">Postos Ativos</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">10K+</p>
                    <p className="text-muted-foreground">Usuários</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">24/7</p>
                    <p className="text-muted-foreground">Suporte</p>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative h-96 sm:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-accent/20 to-accent/5 border border-border flex items-center justify-center">
                <div className="text-center">
                  <Fuel className="h-32 w-32 mx-auto text-accent opacity-20 mb-4" />
                  <p className="text-muted-foreground">Dashboard IAPOS</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="section-padding bg-card border-t border-border">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Funcionalidades Principais
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tudo que você precisa para gerenciar frotas, postos e famílias
                em uma única plataforma.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Fuel,
                  title: "Gestão de Abastecimento",
                  description:
                    "QR codes únicos, débito automático e histórico detalhado de transações.",
                },
                {
                  icon: Users,
                  title: "Controle de Acesso",
                  description:
                    "Múltiplos perfis e níveis de permissão para cada tipo de usuário.",
                },
                {
                  icon: CreditCard,
                  title: "Pagamentos Integrados",
                  description:
                    "PIX, cartão de crédito e débito com processamento seguro.",
                },
                {
                  icon: BarChart3,
                  title: "Relatórios Detalhados",
                  description:
                    "Análises de consumo, receita e performance em tempo real.",
                },
                {
                  icon: Bell,
                  title: "Notificações Automáticas",
                  description:
                    "Alertas por email sobre abastecimentos, recargas e atividades críticas.",
                },
                {
                  icon: Lock,
                  title: "Segurança Avançada",
                  description:
                    "Criptografia end-to-end, autenticação OAuth e conformidade com LGPD.",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="card hover-lift group"
                >
                  <feature.icon className="h-12 w-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="section-padding">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Por que escolher IAPOS?
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      icon: Zap,
                      title: "Implementação Rápida",
                      description:
                        "Comece em minutos, sem complexidade técnica.",
                    },
                    {
                      icon: TrendingUp,
                      title: "Aumento de Receita",
                      description:
                        "Reduza fraudes e aumente o controle de custos.",
                    },
                    {
                      icon: Users,
                      title: "Suporte Dedicado",
                      description:
                        "Equipe disponível 24/7 para ajudar seu negócio.",
                    },
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex gap-4">
                      <benefit.icon className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-muted-foreground">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-accent/20 to-accent/5 border border-border flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-32 w-32 mx-auto text-accent opacity-20 mb-4" />
                  <p className="text-muted-foreground">Crescimento de Receita</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-card border-t border-border">
          <div className="container text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Pronto para transformar seu negócio?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de empresas que já confiam no IAPOS para
              gerenciar suas operações.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={getLoginUrl()} className="btn-primary">
                Criar Conta Grátis
              </a>
              <button className="btn-secondary">Agendar Demo</button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
