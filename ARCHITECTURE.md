# IAPOS - Arquitetura de Dados e Sistema

## 1. Visão Geral

O IAPOS é um SAAS para gestão de abastecimento de combustível que conecta postos, empresas com frotas e famílias através de um sistema unificado de pagamento e controle. A plataforma utiliza autenticação multi-nível com 4 tipos de usuários principais:

1. **Administrativo** - Acesso total ao sistema e relatórios de pagamentos/taxas
2. **Rede de Postos** - Proprietário, Supervisor, Gerente, Caixa, Frentista
3. **Empresas/Frotas** - Proprietário de Frota, Financeiro, Motorista
4. **Famílias** - Responsável, Dependentes

---

## 2. Modelo de Dados (Schema Drizzle)

### 2.1 Tabelas Centrais

#### `users` (Usuários)
Armazena informações de autenticação e perfil básico de todos os usuários.

```
id (PK)
openId (Unique) - Identificador OAuth Manus
email
name
phoneNumber
accountType (enum: 'admin' | 'gas_station' | 'fleet' | 'family')
role (enum: 'admin' | 'owner' | 'supervisor' | 'manager' | 'cashier' | 'attendant' | 'finance' | 'driver' | 'responsible' | 'dependent')
status (enum: 'active' | 'inactive' | 'suspended')
createdAt
updatedAt
lastSignedIn
```

#### `profiles` (Perfis/Entidades Principais)
Armazena informações de negócio para cada entidade (Rede de Postos, Frota, Família).

```
id (PK)
userId (FK) - Proprietário/Responsável
profileType (enum: 'gas_station_network' | 'fleet' | 'family')
name
cnpj/cpf
legalName
contactEmail
contactPhone
address
city
state
zipCode
country
taxId
status (enum: 'active' | 'inactive' | 'suspended')
balance (decimal) - Saldo da conta
createdAt
updatedAt
```

#### `gas_stations` (Postos de Combustível)
Armazena informações de cada posto dentro de uma rede.

```
id (PK)
networkId (FK) - Rede de Postos (profiles)
name
cnpj
address
city
state
zipCode
contactPhone
contactEmail
operatingHours
status (enum: 'active' | 'inactive')
createdAt
updatedAt
```

#### `gas_station_users` (Usuários de Postos)
Relacionamento entre usuários e postos com definição de papéis.

```
id (PK)
gasStationId (FK)
userId (FK)
role (enum: 'supervisor' | 'manager' | 'cashier' | 'attendant')
status (enum: 'active' | 'inactive')
invitedAt
acceptedAt
createdAt
```

#### `vehicles` (Veículos de Frota)
Armazena informações de veículos cadastrados em frotas.

```
id (PK)
fleetId (FK) - Frota (profiles)
licensePlate
vehicleType (enum: 'car' | 'truck' | 'van' | 'motorcycle')
brand
model
year
fuelType (enum: 'gasoline' | 'diesel' | 'ethanol' | 'lpg' | 'cng')
status (enum: 'active' | 'inactive' | 'maintenance')
qrCodeId (FK) - QR Code associado
balance (decimal) - Saldo do veículo
createdAt
updatedAt
```

#### `fleet_users` (Usuários de Frota)
Relacionamento entre usuários e frotas com definição de papéis.

```
id (PK)
fleetId (FK)
userId (FK)
role (enum: 'owner' | 'finance' | 'driver')
status (enum: 'active' | 'inactive')
assignedVehicles (JSON) - IDs de veículos atribuídos (para drivers)
invitedAt
acceptedAt
createdAt
```

#### `family_dependents` (Dependentes de Família)
Armazena informações de dependentes em uma família.

```
id (PK)
familyId (FK) - Família (profiles)
name
cpf
relationship (enum: 'spouse' | 'child' | 'parent' | 'sibling' | 'other')
status (enum: 'active' | 'inactive')
qrCodeId (FK) - QR Code associado
balance (decimal) - Saldo do dependente
createdAt
updatedAt
```

#### `qr_codes` (Códigos QR)
Armazena QR codes únicos para identificação no abastecimento.

```
id (PK)
code (Unique) - Código único gerado
entityType (enum: 'vehicle' | 'dependent')
entityId (FK) - ID do veículo ou dependente
profileId (FK) - ID do perfil (frota ou família)
status (enum: 'active' | 'inactive' | 'expired')
generatedAt
expiresAt (nullable)
regeneratedAt (nullable)
createdAt
```

#### `transactions` (Transações de Abastecimento)
Armazena todas as transações de abastecimento.

```
id (PK)
qrCodeId (FK)
gasStationId (FK)
attendantId (FK) - Usuário frentista
fuelType (enum: 'gasoline' | 'diesel' | 'ethanol' | 'lpg' | 'cng')
liters (decimal)
amountDebited (decimal)
unitPrice (decimal)
totalCost (decimal)
status (enum: 'completed' | 'pending' | 'failed' | 'refunded')
timestamp
createdAt
```

#### `balance_recharges` (Recargas de Saldo)
Armazena histórico de recargas de saldo.

```
id (PK)
profileId (FK)
amount (decimal)
paymentMethod (enum: 'pix' | 'credit_card' | 'debit_card' | 'transfer')
paymentStatus (enum: 'pending' | 'completed' | 'failed' | 'refunded')
transactionId (nullable) - ID externo de pagamento
referenceCode
notes
createdAt
completedAt (nullable)
```

#### `withdrawals` (Resgates de Valores)
Armazena histórico de resgates de valores (apenas para proprietários de rede).

```
id (PK)
networkId (FK)
amount (decimal)
bankAccount (JSON) - Dados bancários
status (enum: 'pending' | 'processing' | 'completed' | 'failed')
requestedAt
processedAt (nullable)
createdAt
```

#### `notifications` (Notificações)
Armazena notificações do sistema.

```
id (PK)
userId (FK)
type (enum: 'fuel_purchase' | 'balance_recharge' | 'withdrawal' | 'user_invitation' | 'system_alert')
title
content
relatedEntityId (nullable)
relatedEntityType (nullable)
read (boolean)
emailSent (boolean)
createdAt
```

#### `invitations` (Convites de Usuários)
Armazena convites para novos usuários.

```
id (PK)
invitedByUserId (FK)
invitedEmail
profileId (FK)
profileType (enum: 'gas_station' | 'fleet' | 'family')
role (enum: 'supervisor' | 'manager' | 'cashier' | 'attendant' | 'finance' | 'driver' | 'dependent')
token (Unique)
status (enum: 'pending' | 'accepted' | 'expired' | 'cancelled')
expiresAt
acceptedAt (nullable)
createdAt
```

---

## 3. Hierarquia de Permissões

### 3.1 Administrativo
- Acesso a todos os relatórios de pagamentos e taxas do sistema
- Visualização de todas as redes, frotas e famílias
- Gestão de suspensões e ativações de contas
- Relatórios de receita e transações globais

### 3.2 Rede de Postos

| Perfil | Permissões |
|--------|-----------|
| **Proprietário** | Acesso a todos os relatórios, resgate de valores, convites de usuários, gestão de postos, acesso a todas as funções |
| **Supervisor** | Acesso a todos os relatórios, sem resgate de valores |
| **Gerente** | Acesso a relatórios do seu posto, seus caixas e frentistas |
| **Caixa** | Acesso a relatórios do seu horário e frentistas associados |
| **Frentista** | Leitura de QR code, débito de saldo, sem acesso a relatórios |

### 3.3 Empresas/Frotas

| Perfil | Permissões |
|--------|-----------|
| **Proprietário de Frota** | Acesso a relatórios completos, recarga de saldo, conferência de saldo, convites de usuários |
| **Financeiro** | Acesso a relatórios da frota |
| **Motorista** | Acesso apenas ao QR code do veículo atribuído |

### 3.4 Famílias

| Perfil | Permissões |
|--------|-----------|
| **Responsável** | Acesso a relatórios, recarga de saldo, gestão de dependentes, convites |
| **Dependente** | Acesso apenas ao QR code pessoal |

---

## 4. Fluxos Principais

### 4.1 Fluxo de Abastecimento (Frentista)
1. Frentista escaneia QR code do cliente (veículo ou dependente)
2. Sistema valida o QR code e carrega saldo disponível
3. Frentista insere: tipo de combustível, valor e litragem
4. Sistema calcula o débito e atualiza o saldo
5. Transação é registrada com timestamp
6. Notificação é enviada ao proprietário/responsável

### 4.2 Fluxo de Recarga de Saldo
1. Proprietário/Responsável acessa tela de recarga
2. Seleciona valor e método de pagamento (PIX ou cartão)
3. Sistema gera referência de pagamento
4. Após confirmação, saldo é creditado
5. Notificação é enviada ao usuário

### 4.3 Fluxo de Convite de Usuário
1. Proprietário acessa gestão de usuários
2. Insere email e seleciona perfil/nível de acesso
3. Sistema gera token de convite e envia email
4. Usuário clica no link e aceita convite
5. Novo usuário é criado com perfil definido

### 4.4 Fluxo de Resgate de Valores (Rede de Postos)
1. Proprietário de rede acessa tela de resgates
2. Visualiza saldo disponível (soma de todas as transações)
3. Solicita resgate informando dados bancários
4. Sistema processa o resgate (integração com banco)
5. Notificação é enviada ao proprietário

---

## 5. Direção Visual (Design System)

### 5.1 Paleta de Cores

**Tema Claro:**
- Fundo Principal: `#FFFFFF`
- Fundo Secundário: `#F8F9FA`
- Texto Principal: `#1A1A1A`
- Texto Secundário: `#666666`
- Primária (CTA): `#FF6B35` (Laranja Vibrante)
- Sucesso: `#2ECC71` (Verde)
- Alerta: `#F39C12` (Amarelo)
- Erro: `#E74C3C` (Vermelho)
- Borda: `#E0E0E0`

**Tema Escuro:**
- Fundo Principal: `#1A1A1A`
- Fundo Secundário: `#2D2D2D`
- Texto Principal: `#FFFFFF`
- Texto Secundário: `#CCCCCC`
- Primária (CTA): `#FF6B35` (Laranja Vibrante)
- Sucesso: `#2ECC71` (Verde)
- Alerta: `#F39C12` (Amarelo)
- Erro: `#E74C3C` (Vermelho)
- Borda: `#444444`

### 5.2 Tipografia

- **Fonte Principal:** Inter (sans-serif) - Moderna e legível
- **Tamanho Base:** 16px
- **Headings:** Inter Bold (700) - H1: 32px, H2: 24px, H3: 20px
- **Body:** Inter Regular (400) - 16px
- **Small:** Inter Regular (400) - 14px

### 5.3 Componentes UI

- **Botões:** Rounded corners (8px), com estados hover/active
- **Cards:** Sombra suave, border-radius 12px
- **Inputs:** Border-radius 8px, foco com ring de cor primária
- **Modais:** Overlay escuro, card centralizado com animação
- **Tabelas:** Striped rows, hover effect, responsiva em mobile
- **Gráficos:** Recharts com cores da paleta

### 5.4 Ícones

- Utilizar **Lucide React** para ícones consistentes
- Tamanho padrão: 20px (ajustável conforme necessário)

---

## 6. Estrutura de Pastas do Projeto

```
/home/ubuntu/IAPOS/
├── client/
│   ├── public/
│   │   ├── logo.svg
│   │   ├── favicon.ico
│   │   └── og-image.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── DashboardLayout.tsx    # Layout para dashboards
│   │   │   ├── Header.tsx             # Header da landing page
│   │   │   ├── Footer.tsx             # Footer
│   │   │   ├── QRCodeScanner.tsx      # Scanner de QR code
│   │   │   ├── QRCodeDisplay.tsx      # Exibição de QR code
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Home.tsx               # Landing page
│   │   │   ├── Login.tsx              # Página de login
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   └── Reports.tsx
│   │   │   ├── gas-station/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Stations.tsx
│   │   │   │   ├── Users.tsx
│   │   │   │   └── Reports.tsx
│   │   │   ├── fleet/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Vehicles.tsx
│   │   │   │   ├── Drivers.tsx
│   │   │   │   └── Reports.tsx
│   │   │   ├── family/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Dependents.tsx
│   │   │   │   └── Reports.tsx
│   │   │   ├── attendant/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   └── Refuel.tsx
│   │   │   └── NotFound.tsx
│   │   ├── contexts/
│   │   │   ├── ThemeContext.tsx
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useProfile.ts
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── trpc.ts
│   │   │   ├── utils.ts
│   │   │   └── qrcode.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── routers/
│   │   ├── auth.ts
│   │   ├── admin.ts
│   │   ├── gasStation.ts
│   │   ├── fleet.ts
│   │   ├── family.ts
│   │   ├── attendant.ts
│   │   └── transaction.ts
│   ├── db.ts
│   ├── routers.ts
│   └── _core/
│       ├── index.ts
│       ├── context.ts
│       ├── trpc.ts
│       ├── env.ts
│       ├── cookies.ts
│       ├── llm.ts
│       ├── notification.ts
│       └── ...
├── drizzle/
│   ├── schema.ts
│   └── migrations/
├── shared/
│   ├── const.ts
│   ├── types.ts
│   └── utils.ts
├── storage/
│   └── index.ts
├── ARCHITECTURE.md
├── todo.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 7. Fluxo de Autenticação e Autorização

### 7.1 Autenticação
1. Usuário clica em "Entrar" na landing page
2. É redirecionado para portal OAuth Manus
3. Após login bem-sucedido, retorna com token
4. Sistema cria/atualiza registro de usuário
5. Cookie de sessão é armazenado
6. Usuário é redirecionado para dashboard apropriado

### 7.2 Autorização (Middleware)
- Cada rota protegida valida o token JWT
- Verifica o `accountType` e `role` do usuário
- Aplica filtros de dados baseados no perfil
- Retorna erro 403 se acesso não autorizado

---

## 8. Integração de Pagamentos

### 8.1 PIX
- Integração com API de PIX (Banco Central)
- Geração de QR code estático ou dinâmico
- Validação de pagamento em tempo real

### 8.2 Cartão de Crédito/Débito
- Integração com gateway de pagamento (Stripe ou similar)
- Tokenização segura de dados de cartão
- Processamento de transações

---

## 9. Sistema de Notificações

### 9.1 Tipos de Notificações
- **Abastecimento Realizado:** Proprietário/Responsável recebe notificação quando saldo é debitado
- **Recarga de Saldo:** Confirmação de recarga bem-sucedida
- **Resgate de Valores:** Confirmação de resgate processado
- **Convite de Usuário:** Email com link para aceitar convite
- **Alerta de Saldo Baixo:** Notificação quando saldo < 10% do máximo
- **Atividade Crítica:** Suspensão de conta, alterações de permissões

### 9.2 Canais
- Email (primário)
- In-app notifications (secundário)

---

## 10. Considerações de Segurança

- Senhas armazenadas com hash bcrypt
- Tokens JWT com expiração de 24 horas
- HTTPS obrigatório em produção
- Rate limiting em endpoints de autenticação
- Validação de entrada em todos os formulários
- CORS configurado para domínios autorizados
- Dados sensíveis (cartão, PIX) nunca armazenados em plain text
- Auditoria de todas as transações e alterações de permissões

---

## 11. Roadmap de Implementação

**Fase 1:** Schema de banco de dados e autenticação
**Fase 2:** Landing page e login
**Fase 3:** Dashboard administrativo
**Fase 4:** Módulo de rede de postos
**Fase 5:** Módulo de frotas
**Fase 6:** Módulo de famílias
**Fase 7:** Sistema de QR code e abastecimento
**Fase 8:** Pagamentos e resgates
**Fase 9:** Notificações e convites
**Fase 10:** Testes e otimizações
**Fase 11:** Deploy em produção

---

## 12. Stack Tecnológico

- **Frontend:** React 19 + TypeScript + TailwindCSS 4 + Vite
- **Backend:** Express 4 + tRPC 11 + Node.js
- **Database:** MySQL/TiDB (Drizzle ORM)
- **Auth:** Manus OAuth
- **UI Components:** shadcn/ui + Lucide React
- **Pagamentos:** Stripe/PIX API
- **Email:** Nodemailer/SendGrid
- **QR Codes:** qrcode.react
- **Gráficos:** Recharts
- **Testes:** Vitest
- **Deployment:** Supabase/Vercel

