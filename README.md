# 🎓 Autoescola SaaS - Plataforma Completa

Plataforma SaaS multi-tenant para autoescolas brasileiras com IA vendedora integrada ao WhatsApp. Inclui backend, frontend web e app mobile nativo.

## 📦 Estrutura do Projeto

```
autoescola-saas/
├── server/                 # Backend (Node.js + Express + Prisma)
├── client/                 # Frontend Web (React 19 + Tailwind CSS)
├── mobile/                 # App Mobile (React Native + Expo)
├── prisma/                 # Schema do banco de dados
├── DOCUMENTACAO.md         # Documentação completa
└── README.md               # Este arquivo
```

## 🚀 Recursos Principais

### Backend
- ✅ Multi-tenancy com isolamento total de dados
- ✅ IA vendedora com OpenAI GPT-4o-mini
- ✅ Integração WhatsApp Cloud API
- ✅ Sistema de filas com BullMQ + Redis
- ✅ Autenticação OAuth Manus + JWT
- ✅ PostgreSQL com Prisma ORM

### Frontend Web
- ✅ Landing page profissional
- ✅ Dashboard administrativo
- ✅ Gestão de clientes com tabela paginada
- ✅ Configurações da IA
- ✅ React 19 + Tailwind CSS 4 + Shadcn/UI

### App Mobile
- ✅ iOS e Android nativos com Expo
- ✅ Dashboard com métricas
- ✅ Gestão de clientes
- ✅ Configurações
- ✅ Offline support

## 🛠️ Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Backend** | Node.js, Express, Prisma, PostgreSQL |
| **Frontend Web** | React 19, Tailwind CSS 4, Shadcn/UI |
| **Mobile** | React Native, Expo |
| **IA** | OpenAI GPT-4o-mini |
| **Mensageria** | WhatsApp Cloud API, BullMQ, Redis |
| **Autenticação** | OAuth Manus, JWT |

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Conta OpenAI com API key
- Conta WhatsApp Business
- Conta Manus OAuth

## 🚀 Instalação Rápida

### Backend

```bash
cd /home/ubuntu/autoescola-saas-backend
pnpm install
pnpm db:push
pnpm dev
```

### Frontend Web

```bash
cd /home/ubuntu/autoescola-saas-backend/client
pnpm install
pnpm dev
```

### App Mobile

```bash
cd /home/ubuntu/autoescola-saas-mobile
pnpm install
pnpm start
# Para iOS: pnpm ios
# Para Android: pnpm android
```

## 🔐 Variáveis de Ambiente

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/autoescola_saas
REDIS_HOST=localhost
REDIS_PORT=6379
OPENAI_API_KEY=sk-...
WHATSAPP_WEBHOOK_TOKEN=seu-token-seguro
WHATSAPP_BUSINESS_ACCOUNT_ID=seu-id
JWT_SECRET=seu-secret-jwt
NODE_ENV=production
```

### Frontend (.env.local)

```env
VITE_API_URL=https://seu-backend.com/api
VITE_OAUTH_CLIENT_ID=seu-client-id
```

## 📚 Documentação

Consulte o arquivo `DOCUMENTACAO.md` para:
- Arquitetura detalhada
- Schema do banco de dados
- Endpoints da API
- Fluxo de mensagens WhatsApp
- Instruções de deploy
- Guia de segurança

## 🧪 Testes

```bash
# Backend
pnpm test

# Frontend
pnpm test

# Mobile
pnpm test
```

## 🔄 CI/CD

O projeto inclui GitHub Actions para:
- Testes automatizados
- Build e deploy
- Análise de código

## 📱 Deploy

### Backend (Cloud Run, Railway, Render)

```bash
pnpm build
pnpm start
```

### Frontend (Vercel, Netlify)

```bash
pnpm build
# Deploy automático via Git
```

### Mobile (App Store, Google Play)

```bash
# iOS
eas build --platform ios --auto-submit

# Android
eas build --platform android --auto-submit
```

## 🔒 Segurança

✅ Isolamento multi-tenant em todas as queries  
✅ Validação JWT em cada requisição  
✅ Middleware de tenant obrigatório  
✅ Rate limiting no webhook  
✅ Input sanitization  
✅ CORS configurado  
✅ HTTPS obrigatório em produção  

## 📞 Suporte

Para dúvidas ou problemas:
- 📖 Consulte a documentação em `DOCUMENTACAO.md`
- 🐛 Abra uma issue no GitHub
- 📧 Entre em contato: support@autoescola-saas.com

## 📄 Licença

MIT

## 👥 Autores

- **Manus AI** - Arquitetura e desenvolvimento

---

**Versão**: 1.0.0  
**Status**: ✅ Pronto para produção  
**Última atualização**: 15 de Março de 2026
