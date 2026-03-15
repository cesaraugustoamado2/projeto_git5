# Autoescola SaaS - TODO

## Backend - Arquitetura Multi-tenant

- [x] Configurar schema Prisma com tabelas: autoescolas, clientes, conversas, vendas, configurações
- [x] Implementar middleware de identificação de tenant via JWT
- [x] Criar funções de isolamento de dados por autoescola_id
- [x] Adicionar validações de segurança em todas as queries

## Backend - Serviços de IA

- [x] Desenvolver gptService.js com integração OpenAI GPT-4o-mini
- [x] Implementar function calling para sinalizar vendas
- [x] Desenvolver vendasAI.js com system prompt personalizado
- [x] Integrar contexto da autoescola (preços, serviços, nome)
- [ ] Criar testes para respostas da IA

## Backend - Integração WhatsApp

- [x] Implementar whatsappController.js com endpoint webhook
- [x] Validar token do Facebook no webhook
- [x] Desenvolver whatsappService.js para envio de mensagens
- [x] Identificar autoescola pelo número de destino
- [x] Buscar ou criar cliente no banco de dados
- [x] Integrar com motor de IA para respostas

## Backend - Filas e Estado

- [ ] Configurar BullMQ para processamento de respostas em background
- [ ] Implementar gerenciamento de estado no Redis com TTL 24h
- [ ] Criar jobs de processamento de mensagens
- [ ] Implementar retry logic para falhas

## Backend - API REST

- [ ] Criar rotas de clientes (GET, POST, PUT, DELETE)
- [ ] Criar rotas de conversas (GET, histórico)
- [ ] Criar rotas de vendas (GET, registrar)
- [ ] Criar rotas de configurações da autoescola
- [ ] Implementar paginação e busca

## Frontend - Dashboard Base

- [x] Configurar projeto Next.js 14 com Tailwind CSS
- [x] Integrar Shadcn/UI
- [x] Criar layout com sidebar navegável
- [x] Implementar autenticação e proteção de rotas
- [x] Criar tema visual consistente

## Frontend - Dashboard Administrativo

- [x] Desenvolver página Dashboard com cards de métricas
- [ ] Exibir total de clientes, conversas, vendas
- [ ] Criar gráficos de vendas por período
- [ ] Implementar filtros por data

## Frontend - Gestão de Clientes

- [x] Criar página de Gestão de Clientes
- [x] Implementar tabela com dados paginados
- [x] Adicionar busca por nome/telefone
- [ ] Criar modal para detalhes do cliente
- [ ] Implementar histórico de conversas

## Frontend - Configurações da IA

- [x] Criar página de Configurações da IA
- [x] Permitir edição do system prompt
- [x] Configurar preços e serviços
- [ ] Gerenciar integração WhatsApp (número, token)
- [ ] Implementar validação de credenciais

## Publicação e Deploy

- [ ] Publicar código no GitHub
- [ ] Configurar credenciais de produção (OpenAI, WhatsApp, PostgreSQL)
- [ ] Configurar variáveis de ambiente em produção
- [ ] Testar deploy em staging
- [ ] Deploy em produção

## Recursos Adicionais

- [ ] Implementar autenticação 2FA
- [ ] Implementar analytics e rastreamento de eventos
- [ ] Criar dashboard de relatórios
- [ ] Implementar exportação de dados (CSV, PDF)
- [ ] Criar sistema de notificações por email

## Testes e Segurança

- [ ] Criar testes unitários para gptService.js
- [ ] Criar testes unitários para whatsappService.js
- [ ] Criar testes de integração para API
- [ ] Criar testes E2E para frontend
- [ ] Criar testes para app mobile
- [ ] Implementar CI/CD com GitHub Actions
- [ ] Audit de segurança
- [ ] Criar testes para middleware de tenant
- [ ] Validar isolamento de dados entre autoescolas
- [ ] Testar webhook do WhatsApp
- [ ] Implementar rate limiting
- [ ] Adicionar validação de entrada (input sanitization)

## Documentação e Deploy

- [ ] Documentar arquitetura multi-tenant
- [ ] Criar guia de configuração de variáveis de ambiente
- [ ] Documentar API REST
- [ ] Preparar para deploy em produção
- [ ] Criar scripts de migração de banco de dados
