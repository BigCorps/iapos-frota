# Guia de Deployment - IAPOS

Instruções completas para fazer deploy do IAPOS em produção.

## 📋 Pré-requisitos

- Repositório GitHub criado e configurado
- Supabase project criado
- Domínio registrado (opcional)
- Conta em serviço de hosting (Vercel, Railway, etc.)

## 🔧 Passo 1: Preparar Repositório GitHub

### 1.1 Criar Repositório

```bash
# Inicializar git (se não estiver)
git init

# Adicionar remote
git remote add origin https://github.com/seu-usuario/iapos.git

# Fazer commit inicial
git add .
git commit -m "Initial commit: IAPOS foundation"

# Push para main
git branch -M main
git push -u origin main
```

### 1.2 Configurar .gitignore

O arquivo `.gitignore` já está configurado. Verifique se inclui:

```
node_modules/
.env
.env.local
dist/
build/
.DS_Store
```

### 1.3 Adicionar Secrets do GitHub

1. Vá para "Settings" → "Secrets and variables" → "Actions"
2. Clique em "New repository secret"
3. Adicione:

```
DATABASE_URL=postgresql://...
VITE_APP_ID=...
OAUTH_SERVER_URL=...
JWT_SECRET=...
# ... todas as outras variáveis
```

## 🚀 Passo 2: Deploy no Vercel (Recomendado)

### 2.1 Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Selecione seu repositório GitHub
4. Clique em "Import"

### 2.2 Configurar Variáveis de Ambiente

1. Em "Environment Variables"
2. Adicione todas as variáveis de `.env.local`

```
DATABASE_URL=postgresql://...
VITE_APP_ID=...
OAUTH_SERVER_URL=...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
# ... etc
```

### 2.3 Configurar Build

Vercel detectará automaticamente:

- **Framework**: Next.js / Vite
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`

Se não detectar, configure manualmente:

```
Build Command: pnpm build
Output Directory: dist
Install Command: pnpm install
```

### 2.4 Deploy

1. Clique em "Deploy"
2. Aguarde o build completar
3. Seu site estará em `https://seu-projeto.vercel.app`

### 2.5 Configurar Domínio Customizado

1. Em "Settings" → "Domains"
2. Clique em "Add Domain"
3. Digite seu domínio
4. Configure DNS records conforme instruído

## 🚂 Passo 3: Deploy no Railway (Alternativa)

### 3.1 Conectar Repositório

1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Autorize e selecione seu repositório

### 3.2 Configurar Variáveis

1. Em "Variables"
2. Adicione todas as variáveis necessárias

### 3.3 Configurar Build

```
Build Command: pnpm build
Start Command: NODE_ENV=production node dist/index.js
```

### 3.4 Deploy

Railway fará deploy automaticamente a cada push para `main`.

## 🔐 Passo 4: Configurar Segurança

### 4.1 HTTPS

- Vercel/Railway já incluem HTTPS automaticamente
- Certifique-se de usar `https://` em todas as URLs

### 4.2 CORS

Configure CORS para seu domínio:

```typescript
// server/_core/index.ts
app.use(cors({
  origin: [
    "https://seu-dominio.com",
    "https://www.seu-dominio.com",
  ],
  credentials: true,
}));
```

### 4.3 Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
});

app.use("/api/", limiter);
```

### 4.4 Variáveis de Ambiente Sensíveis

Nunca commite:
- Chaves de API
- Senhas
- Tokens

Use `.env.local` (ignorado pelo git) para desenvolvimento.

## 📊 Passo 5: Configurar Banco de Dados

### 5.1 Supabase em Produção

1. Crie um projeto Supabase separado para produção
2. Copie a `DATABASE_URL` de produção
3. Configure em variáveis de ambiente do seu host

### 5.2 Backup Automático

Supabase oferece backups automáticos. Configure em:

Settings → Backups → Enable automated backups

### 5.3 Executar Migrations em Produção

```bash
# Localmente (com DATABASE_URL de produção)
DATABASE_URL=postgresql://... pnpm db:push

# Ou via GitHub Actions (veja próxima seção)
```

## 🔄 Passo 6: CI/CD com GitHub Actions

### 6.1 Criar Workflow

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 10.4.1

      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: pnpm db:push

      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 6.2 Configurar Secrets do GitHub

Adicione em "Settings" → "Secrets":

```
DATABASE_URL=postgresql://...
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...
```

## 📧 Passo 7: Configurar Email em Produção

### 7.1 SendGrid

```env
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=SG.xxx
EMAIL_FROM_ADDRESS=noreply@iapos.com
```

### 7.2 Resend (Recomendado)

```env
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_xxx
EMAIL_FROM_ADDRESS=noreply@iapos.com
```

## 💳 Passo 8: Configurar Pagamentos em Produção

### 8.1 Stripe

1. Mude para chaves de produção (não teste)
2. Configure webhooks para seu domínio:
   - `https://seu-dominio.com/api/webhooks/stripe`

```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 8.2 PIX (Mercado Pago)

```env
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_xxx
MERCADO_PAGO_CLIENT_ID=xxx
MERCADO_PAGO_CLIENT_SECRET=xxx
```

## 📊 Passo 9: Monitoramento e Logs

### 9.1 Sentry (Error Tracking)

```bash
npm install @sentry/node
```

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 9.2 Logs

```bash
# Vercel
vercel logs

# Railway
railway logs

# Supabase
# Vá para Settings → Logs
```

## 🧪 Passo 10: Testes Pré-Deploy

### 10.1 Testes Locais

```bash
# Testes unitários
pnpm test

# Build
pnpm build

# Verificar tipos
pnpm check
```

### 10.2 Testes em Staging

Crie um ambiente de staging antes de produção:

```bash
# Deploy para staging
git push origin staging

# Vercel criará automaticamente um preview
```

### 10.3 Smoke Tests

```typescript
// tests/smoke.test.ts
describe("Smoke Tests", () => {
  it("should load homepage", async () => {
    const response = await fetch("https://seu-dominio.com");
    expect(response.status).toBe(200);
  });

  it("should connect to database", async () => {
    const result = await db.select().from(users).limit(1);
    expect(Array.isArray(result)).toBe(true);
  });
});
```

## 🚨 Troubleshooting

### Build falha com "Cannot find module"

```bash
# Limpar cache
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Database connection refused

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
mysql -u user -p -h host -D database
```

### Webhook não recebe eventos

```bash
# Verificar URL do webhook
# Stripe/Mercado Pago → Settings → Webhooks

# Testar manualmente
curl -X POST https://seu-dominio.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"payment_intent.succeeded"}'
```

### Variáveis de ambiente não carregam

```bash
# Verificar se existem
vercel env list

# Redeployar
vercel --prod
```

## ✅ Checklist de Deploy

- [ ] Repositório GitHub criado e configurado
- [ ] `.gitignore` está correto
- [ ] Supabase project criado
- [ ] Migrations executadas
- [ ] Variáveis de ambiente configuradas
- [ ] Testes passando localmente
- [ ] Build sem erros
- [ ] Domínio registrado (opcional)
- [ ] SSL/HTTPS configurado
- [ ] Email configurado
- [ ] Stripe/PIX configurado
- [ ] Monitoramento configurado
- [ ] Backups automáticos habilitados
- [ ] Logs configurados
- [ ] CI/CD workflow criado
- [ ] Smoke tests passando

## 📞 Suporte

Para problemas:

1. Verifique logs em Vercel/Railway
2. Consulte Supabase docs
3. Abra issue no repositório
4. Entre em contato com o time

---

**Seu IAPOS está em produção! 🎉**
