# IAPOS - Project TODO

## Database & Schema
- [x] Criar schema Drizzle com tabelas de usuários, perfis, postos, frotas, veículos, dependentes
- [x] Criar tabelas de transações, recargas, resgates, notificações, convites
- [x] Criar tabelas de QR codes e histórico de abastecimentos
- [x] Implementar migrations do Drizzle
- [x] Criar índices para otimização de queries

## Authentication & Authorization
- [x] Implementar autenticação OAuth Manus
- [x] Criar sistema de perfis e papéis (RBAC)
- [x] Implementar middleware de autorização
- [x] Criar procedures protegidas para cada tipo de usuário
- [x] Implementar verificação de permissões em endpoints
- [x] Criar helpers de autorização para queries

## Landing Page
- [x] Criar layout da landing page com header e footer
- [x] Implementar seção hero com CTA
- [x] Criar seção de funcionalidades principais
- [x] Implementar seção de benefícios
- [ ] Criar seção de pricing/planos (se aplicável)
- [x] Implementar footer com links e contato
- [x] Adicionar suporte a temas claro/escuro
- [x] Garantir responsividade mobile/desktop
- [x] Implementar animações e micro-interações

## Admin Dashboard
- [ ] Criar layout do dashboard administrativo
- [ ] Implementar visualização de todas as redes de postos
- [ ] Implementar visualização de todas as frotas
- [ ] Implementar visualização de todas as famílias
- [ ] Criar relatório de pagamentos globais
- [ ] Criar relatório de taxas do sistema
- [ ] Implementar gráficos de receita e transações
- [ ] Criar tabela de usuários com filtros
- [ ] Implementar gestão de suspensões/ativações
- [ ] Criar export de relatórios (PDF/CSV)

## Gas Station Network Module
- [ ] Criar dashboard de rede de postos
- [x] Implementar gestão de postos (CRUD) - Router criado
- [ ] Criar gestão hierárquica de usuários
- [ ] Implementar sistema de convites para usuários
- [ ] Criar tela de relatórios por nível de acesso
- [ ] Implementar relatório de supervisor (sem resgate)
- [ ] Implementar relatório de gerente (por posto)
- [ ] Implementar relatório de caixa (por horário)
- [ ] Criar sistema de resgate de valores
- [ ] Implementar histórico de resgates
- [ ] Criar tela de configurações da rede

## Fleet Module
- [ ] Criar dashboard de frota
- [x] Implementar gestão de veículos (CRUD) - Router criado
- [ ] Criar gestão de motoristas
- [ ] Implementar atribuição de veículos a motoristas
- [ ] Criar tela de recarga de saldo
- [ ] Implementar conferência de saldo
- [ ] Criar relatórios de consumo por veículo
- [ ] Implementar relatórios de motorista
- [ ] Criar sistema de convites para usuários
- [ ] Implementar histórico de transações
- [ ] Criar tela de configurações da frota

## Family Module
- [ ] Criar dashboard de família
- [x] Implementar gestão de dependentes (CRUD) - Router criado
- [ ] Criar tela de recarga de saldo
- [ ] Implementar conferência de saldo
- [ ] Criar relatórios de consumo por dependente
- [ ] Implementar histórico de transações
- [ ] Criar sistema de convites para dependentes
- [ ] Implementar tela de configurações da família

## QR Code System
- [ ] Criar gerador de QR codes único para veículos
- [ ] Criar gerador de QR codes para dependentes
- [ ] Implementar armazenamento de QR codes no banco
- [ ] Criar tela de exibição de QR code
- [ ] Implementar regeneração de QR codes
- [ ] Criar validação de QR codes
- [ ] Implementar controle de validade de QR codes
- [ ] Criar scanner de QR code para frentistas

## Attendant Refuel Interface
- [ ] Criar tela de abastecimento para frentista
- [ ] Implementar scanner de QR code
- [ ] Criar formulário de débito (combustível, valor, litragem)
- [ ] Implementar validação de saldo
- [ ] Criar processamento de transação
- [ ] Implementar atualização de saldo em tempo real
- [ ] Criar confirmação de transação
- [ ] Implementar histórico de abastecimentos do frentista
- [ ] Criar interface sem acesso a relatórios

## Payment Integration
- [ ] Integrar gateway de pagamento (Stripe ou similar)
- [ ] Implementar pagamento com cartão de crédito
- [ ] Implementar pagamento com cartão de débito
- [ ] Integrar API de PIX
- [ ] Criar geração de QR code PIX
- [ ] Implementar validação de pagamento
- [ ] Criar webhook para confirmação de pagamento
- [ ] Implementar retry de pagamentos falhados
- [ ] Criar histórico de pagamentos

## Notifications System
- [ ] Criar tabela de notificações
- [ ] Implementar notificação de abastecimento realizado
- [ ] Implementar notificação de recarga de saldo
- [ ] Implementar notificação de resgate de valores
- [ ] Implementar notificação de convite de usuário
- [ ] Implementar notificação de saldo baixo
- [ ] Implementar notificação de atividade crítica
- [ ] Criar integração com email (Nodemailer/SendGrid)
- [ ] Implementar fila de emails (Bull/RabbitMQ)
- [ ] Criar tela de notificações in-app
- [ ] Implementar marcação de notificações como lidas

## User Invitations System
- [ ] Criar sistema de geração de tokens de convite
- [ ] Implementar envio de email de convite
- [ ] Criar tela de aceitação de convite
- [ ] Implementar validação de token
- [ ] Criar expiração de tokens
- [ ] Implementar reenvio de convites
- [ ] Criar gestão de convites pendentes
- [ ] Implementar cancelamento de convites

## User Management
- [ ] Criar tela de perfil de usuário
- [ ] Implementar edição de dados pessoais
- [ ] Criar alteração de senha
- [ ] Implementar autenticação de dois fatores (2FA) - opcional
- [ ] Criar tela de preferências de notificação
- [ ] Implementar logout
- [ ] Criar histórico de atividades do usuário
- [ ] Implementar exclusão de conta

## UI/UX & Design
- [ ] Implementar tema claro padrão
- [ ] Implementar tema escuro
- [ ] Criar sistema de cores consistente
- [ ] Implementar tipografia consistente
- [ ] Criar componentes reutilizáveis
- [ ] Implementar responsividade mobile
- [ ] Implementar responsividade tablet
- [ ] Criar animações e transições
- [ ] Implementar loading states
- [ ] Implementar error states
- [ ] Criar empty states

## Testing
- [ ] Criar testes unitários para procedures de autenticação
- [ ] Criar testes para autorização e RBAC
- [ ] Criar testes para cálculo de transações
- [ ] Criar testes para validação de QR codes
- [ ] Criar testes para processamento de pagamentos
- [ ] Criar testes para notificações
- [ ] Criar testes para convites
- [ ] Executar testes de integração

## Documentation
- [ ] Documentar API de autenticação
- [ ] Documentar procedures tRPC
- [ ] Documentar fluxos de usuário
- [ ] Documentar estrutura de banco de dados
- [ ] Criar guia de deployment
- [ ] Criar guia de configuração de variáveis de ambiente
- [ ] Documentar sistema de permissões
- [ ] Criar README do projeto

## Performance & Security
- [ ] Implementar rate limiting
- [ ] Implementar validação de entrada
- [ ] Implementar sanitização de dados
- [ ] Criar logs de auditoria
- [ ] Implementar criptografia de dados sensíveis
- [ ] Otimizar queries de banco de dados
- [ ] Implementar cache de dados frequentes
- [ ] Criar backup automático de banco de dados
- [ ] Implementar CORS corretamente
- [ ] Configurar headers de segurança

## Deployment & DevOps
- [ ] Configurar variáveis de ambiente para produção
- [ ] Criar script de migration de banco de dados
- [ ] Configurar CI/CD pipeline
- [ ] Criar Dockerfile (se necessário)
- [ ] Configurar deploy em Supabase
- [ ] Implementar monitoramento de erros
- [ ] Criar alertas para falhas críticas
- [ ] Configurar backup automático
- [ ] Testar processo de rollback

## Optional Features (Future)
- [ ] Integração com IA para análise de consumo
- [ ] Relatórios preditivos de consumo
- [ ] Integração com sistemas de frota terceirizados
- [ ] Aplicativo mobile nativo
- [ ] API pública para integrações
- [ ] Webhooks customizáveis
- [ ] Integração com sistemas de ERP
- [ ] Suporte a múltiplas moedas
- [ ] Geolocalização de postos
- [ ] Mapa de postos disponíveis
