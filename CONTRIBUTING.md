# Guia de Contribuição - IAPOS

Obrigado por considerar contribuir para o IAPOS! Este documento fornece diretrizes e instruções para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Começar](#como-começar)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Commits e Pull Requests](#commits-e-pull-requests)
- [Testes](#testes)

## 🤝 Código de Conduta

- Seja respeitoso com todos os contribuidores
- Forneça feedback construtivo
- Foque em o que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

## 🚀 Como Começar

### 1. Fork o Repositório

```bash
git clone https://github.com/seu-usuario/iapos.git
cd iapos
```

### 2. Criar Branch para sua Feature

```bash
git checkout -b feature/sua-feature
# ou
git checkout -b fix/seu-bug
```

### 3. Instalar Dependências

```bash
pnpm install
```

### 4. Criar `.env.local`

```bash
cp .env.example .env.local
# Editar com suas credenciais locais
```

### 5. Iniciar Servidor de Desenvolvimento

```bash
pnpm dev
```

## 🛠️ Processo de Desenvolvimento

### Estrutura de Branches

- `main` - Produção (protegido)
- `develop` - Desenvolvimento (base para features)
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `docs/*` - Documentação

### Workflow Típico

1. **Criar feature branch** a partir de `develop`
2. **Implementar mudanças** seguindo padrões de código
3. **Escrever testes** para novas funcionalidades
4. **Executar testes** localmente
5. **Fazer commit** com mensagens descritivas
6. **Abrir Pull Request** para `develop`
7. **Code Review** e aprovação
8. **Merge** para `develop`
9. **Release** para `main` (periodicamente)

## 💻 Padrões de Código

### TypeScript

- Use tipos explícitos sempre que possível
- Evite `any` - use tipos genéricos
- Exporte tipos públicos de componentes

```typescript
// ✅ Bom
interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export function getUserProfile(id: number): Promise<UserProfile> {
  // ...
}

// ❌ Ruim
export function getUserProfile(id: any): any {
  // ...
}
```

### React Components

- Use functional components com hooks
- Nomeie componentes com PascalCase
- Exporte componentes como default
- Adicione PropTypes ou interfaces para props

```typescript
// ✅ Bom
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export default function Button({ label, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}

// ❌ Ruim
export default function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### tRPC Routers

- Organize routers por feature em `server/routers/`
- Use `protectedProcedure` para rotas autenticadas
- Valide inputs com Zod ou tipos TypeScript
- Retorne dados estruturados

```typescript
// ✅ Bom
export const fleetRouter = router({
  getVehicles: protectedProcedure
    .input(z.object({ fleetId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verificar autorização
      const canAccess = await canAccessFleetData(ctx.user, input.fleetId);
      if (!canAccess) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      // Retornar dados
      return getVehiclesByFleetId(input.fleetId);
    }),
});
```

### Estilos CSS

- Use Tailwind CSS para estilos
- Mantenha componentes responsivos
- Use variáveis de tema para cores
- Evite CSS customizado quando Tailwind for suficiente

```typescript
// ✅ Bom
<div className="flex gap-4 p-4 rounded-lg bg-card text-card-foreground">
  <h2 className="text-xl font-semibold">Título</h2>
</div>

// ❌ Ruim
<div style={{ display: 'flex', gap: '16px', padding: '16px', borderRadius: '8px' }}>
  <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Título</h2>
</div>
```

### Nomes de Arquivos

- Componentes React: `PascalCase.tsx`
- Utilitários/Hooks: `camelCase.ts`
- Páginas: `PascalCase.tsx`
- Routers: `camelCase.ts`
- Estilos: `camelCase.css`

```
client/
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ui/
│       ├── Button.tsx
│       └── Card.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useTheme.ts
├── pages/
│   ├── Home.tsx
│   └── Dashboard.tsx
└── lib/
    └── trpc.ts

server/
├── routers/
│   ├── auth.ts
│   ├── fleet.ts
│   └── gasStation.ts
└── db.ts
```

## 📝 Commits e Pull Requests

### Mensagens de Commit

Use o formato Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - Nova funcionalidade
- `fix` - Correção de bug
- `docs` - Documentação
- `style` - Formatação (sem mudança de lógica)
- `refactor` - Refatoração de código
- `perf` - Melhorias de performance
- `test` - Testes
- `chore` - Manutenção

**Exemplos:**

```
feat(fleet): add vehicle management dashboard

- Implement CRUD operations for vehicles
- Add real-time balance tracking
- Create vehicle assignment UI

Closes #123
```

```
fix(auth): prevent session hijacking

- Add CSRF token validation
- Implement secure cookie flags
- Add rate limiting to login endpoint
```

### Pull Requests

1. **Título descritivo** - Explique o que muda
2. **Descrição clara** - Por que essa mudança é necessária
3. **Referências** - Linke issues relacionadas
4. **Screenshots** - Para mudanças UI
5. **Checklist** - Confirme que testou

**Template:**

```markdown
## Descrição
Breve descrição do que foi implementado.

## Tipo de Mudança
- [ ] Nova funcionalidade
- [ ] Correção de bug
- [ ] Breaking change
- [ ] Documentação

## Como Testar
Instruções para testar a mudança.

## Screenshots
Se aplicável, adicione screenshots.

## Checklist
- [ ] Código segue padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Sem console.log ou debug code
- [ ] Build passa sem erros
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
pnpm test

# Modo watch
pnpm test --watch

# Teste específico
pnpm test auth.logout

# Com cobertura
pnpm test --coverage
```

### Escrever Testes

Coloque testes próximos aos arquivos que testam:

```
server/
├── routers/
│   ├── fleet.ts
│   └── fleet.test.ts
└── db.ts
```

**Exemplo de teste:**

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "@/server/routers";

describe("fleet.createVehicle", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    // Setup
    ctx = createMockContext();
  });

  it("should create a vehicle for fleet owner", async () => {
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.fleet.createVehicle({
      fleetId: 1,
      licensePlate: "ABC-1234",
      vehicleType: "truck",
      fuelType: "diesel",
    });

    expect(result.id).toBeDefined();
    expect(result.licensePlate).toBe("ABC-1234");
  });

  it("should reject non-owners", async () => {
    ctx.user.role = "driver";
    const caller = appRouter.createCaller(ctx);
    
    await expect(
      caller.fleet.createVehicle({...})
    ).rejects.toThrow("FORBIDDEN");
  });
});
```

## 🔍 Code Review

### O que Procurar

- **Segurança** - Validação de inputs, autenticação, autorização
- **Performance** - Queries otimizadas, sem N+1 problems
- **Testes** - Cobertura adequada de casos
- **Documentação** - Código claro e comentado quando necessário
- **Estilo** - Consistência com padrões do projeto

### Feedback Construtivo

```
// ✅ Bom
"Considere usar `useMemo` aqui para evitar re-renders desnecessários. 
Veja este exemplo: [link]"

// ❌ Ruim
"Isso está errado."
```

## 📚 Recursos Úteis

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
- [tRPC Documentation](https://trpc.io)
- [Tailwind CSS](https://tailwindcss.com)
- [Drizzle ORM](https://orm.drizzle.team)

## ❓ Dúvidas?

- Abra uma issue para discussão
- Participe das code reviews
- Consulte a documentação em `ARCHITECTURE.md`

---

Obrigado por contribuir! 🎉
