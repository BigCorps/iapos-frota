# IAPOS - Gestão de Frotas e Rede de Postos
Uma plataforma web completa para gestão de abastecimento de combustível que conecta postos, empresas com frotas e famílias através de um sistema unificado de pagamento e controle.

## 🚀 Características Principais

- **Autenticação Multi-Nível**: 4 tipos de usuários com controle de acesso granular (RBAC)
- **Gestão de Postos**: Cadastro e gerenciamento hierárquico de redes de postos
- **Gestão de Frotas**: Controle de veículos, motoristas e saldo
- **Gestão de Famílias**: Cadastro de dependentes com QR codes individuais
- **Sistema de QR Code**: Identificação única por veículo/dependente
- **Abastecimento em Tempo Real**: Interface para frentistas com débito automático
- **Pagamentos Integrados**: PIX e cartão de crédito/débito
- **Relatórios Detalhados**: Análises de consumo, receita e performance
- **Notificações Automáticas**: Email para abastecimentos, recargas e atividades críticas
- **Temas Claro/Escuro**: Interface responsiva para desktop e mobile

## 📋 Pré-requisitos

- **Node.js** 18+ ou superior
- **pnpm** 10.4.1+ (gerenciador de pacotes)
- **MySQL/TiDB** 8.0+ ou **Supabase** (banco de dados)
- **Git** para controle de versão

## 🛠️ Instalação Local

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/iapos.git
cd iapos
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com base em `.env.example`:

```bash
cp .env.example .env.local
```

Edite `.env.local` e preencha as variáveis necessárias:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/iapos_dev

# OAuth Manus
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
JWT_SECRET=sua_chave_jwt_secreta

# Owner
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome

# APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave_api
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_chave_frontend

# Pagamentos (opcional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 4. Configurar Banco de Dados

#### Opção A: MySQL Local

```bash
# Criar banco de dados
mysql -u root -p -e "CREATE DATABASE iapos_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Executar migrations
pnpm db:push
```

#### Opção B: Supabase (Recomendado para Produção)

1. Criar projeto em [supabase.com](https://supabase.com)
2. Copiar `DATABASE_URL` do painel do Supabase
3. Executar migrations:

```bash
pnpm db:push
```

### 5. Iniciar Servidor de Desenvolvimento

```bash
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
iapos/
├── client/                 # Frontend React
│   ├── public/            # Assets estáticos
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilitários
│   │   ├── App.tsx        # Roteamento principal
│   │   └── index.css      # Estilos globais
│   └── index.html
├── server/                # Backend Node.js + Express
│   ├── routers/           # tRPC routers
│   ├── db.ts              # Helpers de banco de dados
│   ├── routers.ts         # Agregador de routers
│   └── _core/             # Configuração interna
├── drizzle/               # Schema e migrations
│   ├── schema.ts          # Definição de tabelas
│   └── migrations/        # Arquivos SQL
├── shared/                # Código compartilhado
├── storage/               # Helpers de S3
├── ARCHITECTURE.md        # Documentação de arquitetura
├── README.md              # Este arquivo
└── package.json
```

## 🗄️ Banco de Dados

### Schema Principal

O projeto inclui 13 tabelas principais:

- **users** - Usuários do sistema
- **profiles** - Perfis (Rede, Frota, Família)
- **gasStations** - Postos de combustível
- **gasStationUsers** - Usuários de postos
- **vehicles** - Veículos de frota
- **fleetUsers** - Usuários de frota
- **familyDependents** - Dependentes de família
- **qrCodes** - QR codes únicos
- **transactions** - Transações de abastecimento
- **balanceRecharges** - Recargas de saldo
- **withdrawals** - Resgates de valores
- **notifications** - Notificações do sistema
- **invitations** - Convites de usuários

### Executar Migrations

```bash
# Gerar e aplicar migrations
pnpm db:push

# Apenas gerar migrations
pnpm db:generate

# Apenas aplicar migrations
pnpm db:migrate
```

## 🔐 Autenticação e Autorização

### Tipos de Usuários

1. **Administrativo**
   - Acesso a todos os relatórios
   - Gestão de suspensões/ativações
   - Visualização de taxas globais

2. **Rede de Postos**
   - Proprietário: Acesso completo, resgate de valores
   - Supervisor: Acesso a relatórios, sem resgate
   - Gerente: Acesso ao seu posto
   - Caixa: Acesso ao seu horário
   - Frentista: Leitura de QR code, débito

3. **Empresas/Frotas**
   - Proprietário: Acesso completo, recarga de saldo
   - Financeiro: Acesso a relatórios
   - Motorista: Acesso ao QR code do veículo

4. **Famílias**
   - Responsável: Acesso completo, recarga de saldo
   - Dependente: Acesso ao QR code pessoal

### Verificação de Permissões

Use os helpers de autorização em `server/_core/authorization.ts`:

```typescript
import { requireRole, requireAdmin, canAccessFleetData } from "@/server/_core/authorization";

// Em um procedure tRPC:
myProcedure.mutation(async ({ ctx, input }) => {
  requireAdmin(ctx.user);  // Lança erro se não for admin
  
  const hasAccess = await canAccessFleetData(ctx.user, fleetId);
  if (!hasAccess) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
});
```

## 📡 API tRPC

### Routers Disponíveis

- **auth** - Autenticação e logout
- **profile** - Gestão de perfis
- **gasStation** - Gestão de postos
- **fleet** - Gestão de frotas
- **family** - Gestão de famílias

### Exemplo de Uso no Frontend

```typescript
import { trpc } from "@/lib/trpc";

export function MyComponent() {
  // Query
  const { data: profiles } = trpc.profile.getMyProfiles.useQuery();
  
  // Mutation
  const createVehicle = trpc.fleet.createVehicle.useMutation({
    onSuccess: () => {
      // Invalidar cache
      trpc.useUtils().fleet.getFleetVehicles.invalidate();
    }
  });
  
  return (
    <button onClick={() => createVehicle.mutate({...})}>
      Criar Veículo
    </button>
  );
}
```

## 🎨 Design System

### Cores (Tema Claro)

- **Primária (Accent)**: `#FF6B35` (Laranja Vibrante)
- **Fundo**: `#FFFFFF`
- **Texto**: `#1A1A1A`
- **Borda**: `#E0E0E0`

### Cores (Tema Escuro)

- **Primária (Accent)**: `#FF6B35` (Laranja Vibrante)
- **Fundo**: `#1A1A1A`
- **Texto**: `#FFFFFF`
- **Borda**: `#444444`

### Tipografia

- **Fonte**: Inter (sans-serif)
- **Tamanho Base**: 16px
- **Headings**: H1 (32px), H2 (24px), H3 (20px)

## 🧪 Testes

### Executar Testes

```bash
# Rodar todos os testes
pnpm test

# Modo watch
pnpm test --watch

# Com cobertura
pnpm test --coverage
```

### Exemplo de Teste

```typescript
import { describe, it, expect } from "vitest";
import { appRouter } from "@/server/routers";

describe("auth.logout", () => {
  it("clears session cookie", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
```

## 🚀 Build e Deployment

### Build para Produção

```bash
pnpm build
```

Isso gera:
- `dist/` - Frontend compilado
- `dist/index.js` - Backend compilado

### Deploy no Supabase

1. Conectar repositório GitHub ao Supabase
2. Configurar variáveis de ambiente no painel
3. Deploy automático em cada push para `main`

### Deploy em Outro Servidor

```bash
# Build
pnpm build

# Iniciar servidor
NODE_ENV=production node dist/index.js
```

## 📊 Integração de Pagamentos

### Stripe (Cartão de Crédito/Débito)

1. Criar conta em [stripe.com](https://stripe.com)
2. Obter chaves API
3. Configurar em `.env.local`:

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### PIX (Pagamento Brasileiro)

1. Integrar com banco que oferece API de PIX
2. Configurar credenciais:

```env
PIX_API_KEY=...
PIX_API_SECRET=...
PIX_MERCHANT_ID=...
```

## 📧 Notificações por Email

### Configurar SendGrid

1. Criar conta em [sendgrid.com](https://sendgrid.com)
2. Obter API key
3. Configurar em `.env.local`:

```env
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=SG.xxx
EMAIL_FROM_ADDRESS=noreply@iapos.com
```

## 🐛 Troubleshooting

### Erro: "DATABASE_URL not set"

Certifique-se de que `.env.local` existe e contém `DATABASE_URL`:

```bash
cp .env.example .env.local
# Editar .env.local com suas credenciais
```

### Erro: "Cannot find module"

Reinstale dependências:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Porta 3000 já em uso

Mude a porta:

```bash
PORT=3001 pnpm dev
```

## 📚 Documentação Adicional

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura detalhada do sistema
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guia de contribuição
- [API.md](./docs/API.md) - Documentação da API tRPC

## 📝 Licença

Este projeto é propriedade da BigCorps e não é de código aberto.

## 🤝 Suporte

Para suporte, entre em contato com o time de desenvolvimento ou abra uma issue no repositório.

---

**Desenvolvido com ❤️ por Manus AI**
