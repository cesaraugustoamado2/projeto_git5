# 🎓 Autoescola SaaS - Documentação Completa

## 📋 Visão Geral

Plataforma SaaS multi-tenant completa para autoescolas brasileiras com IA vendedora integrada ao WhatsApp. Inclui:

- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Frontend Web**: React 19 + Tailwind CSS 4 + Shadcn/UI
- **Mobile App**: React Native + Expo (iOS e Android)
- **IA Vendedora**: OpenAI GPT-4o-mini com function calling
- **Integração WhatsApp**: Cloud API com webhook
- **Filas**: BullMQ + Redis
- **Autenticação**: OAuth Manus + JWT

---

## 🏗️ Arquitetura Multi-tenant

### Isolamento de Dados

Cada autoescola (tenant) tem seus dados completamente isolados:

```
Autoescola A
├── Clientes (apenas de A)
├── Conversas (apenas de A)
├── Vendas (apenas de A)
└── Configurações (apenas de A)

Autoescola B
├── Clientes (apenas de B)
├── Conversas (apenas de B)
├── Vendas (apenas de B)
└── Configurações (apenas de B)
```

### Validação de Tenant

Em **TODAS** as queries do banco de dados:

```sql
SELECT * FROM clientes WHERE autoescola_id = ? AND id = ?
```

Middleware valida o tenant em cada requisição:

```typescript
// server/middleware/tenantMiddleware.ts
export function validateTenantAccess(autoescolaId: string, userAutoescolaId: string) {
  if (autoescolaId !== userAutoescolaId) {
    throw new Error("Unauthorized: Tenant mismatch");
  }
}
```

---

## 📊 Schema Prisma

### Tabelas Principais

```prisma
model Autoescola {
  id String @id @default(cuid())
  nome String
  telefone String
  email String
  whatsappBusinessId String
  whatsappToken String
  clientes Cliente[]
  conversas Conversa[]
  vendas Venda[]
  configuracao Configuracao?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Cliente {
  id String @id @default(cuid())
  autoescolaId String
  autoescola Autoescola @relation(fields: [autoescolaId], references: [id])
  nome String
  telefone String @unique
  email String?
  status String @default("prospect")
  conversas Conversa[]
  vendas Venda[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Conversa {
  id String @id @default(cuid())
  autoescolaId String
  autoescola Autoescola @relation(fields: [autoescolaId], references: [id])
  clienteId String
  cliente Cliente @relation(fields: [clienteId], references: [id])
  mensagens Mensagem[]
  status String @default("ativa")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Mensagem {
  id String @id @default(cuid())
  conversaId String
  conversa Conversa @relation(fields: [conversaId], references: [id])
  conteudo String
  remetente String // "usuario" ou "ia"
  createdAt DateTime @default(now())
}

model Venda {
  id String @id @default(cuid())
  autoescolaId String
  autoescola Autoescola @relation(fields: [autoescolaId], references: [id])
  clienteId String
  cliente Cliente @relation(fields: [clienteId], references: [id])
  tipo String // "teoria", "manobra", "rua", "matricula"
  valor Float
  status String @default("pendente")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Configuracao {
  id String @id @default(cuid())
  autoescolaId String @unique
  autoescola Autoescola @relation(fields: [autoescolaId], references: [id])
  systemPrompt String
  precoAulaTeoria Float
  precoAulaManobra Float
  precoAulaRua Float
  precoMatricula Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model User {
  id Int @id @autoincrement()
  openId String @unique
  name String?
  email String?
  loginMethod String?
  role String @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lastSignedIn DateTime @default(now())
}
```

---

## 🤖 Serviço de IA Vendedora

### gptService.ts

Integração com OpenAI GPT-4o-mini:

```typescript
export async function generateAIResponse(
  userMessage: string,
  autoescolaContext: AutoescolaContext,
  conversationHistory: Message[]
): Promise<AIResponse> {
  const systemPrompt = `
    Você é a assistente virtual da ${autoescolaContext.nome}.
    Seu tom é amigável, prestativo e focado em fechar matrículas.
    Você conhece as leis de trânsito brasileiras (CFC) e o processo de tirar a CNH.
    
    Preços dos serviços:
    - Aula de Teoria: R$ ${autoescolaContext.precoTeoria}
    - Aula de Manobra: R$ ${autoescolaContext.precoManobra}
    - Aula de Rua: R$ ${autoescolaContext.precoRua}
    - Matrícula: R$ ${autoescolaContext.precoMatricula}
  `;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.remetente === "usuario" ? "user" : "assistant",
        content: msg.conteudo
      })),
      { role: "user", content: userMessage }
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "registrar_venda",
          description: "Registra uma venda quando o cliente manifesta interesse",
          parameters: {
            type: "object",
            properties: {
              tipo: { type: "string", enum: ["teoria", "manobra", "rua", "matricula"] },
              valor: { type: "number" }
            }
          }
        }
      }
    ]
  });

  return response;
}
```

### vendasAI.ts

Processamento de vendas com function calling:

```typescript
export async function processarMensagem(
  mensagem: string,
  clienteId: string,
  autoescolaId: string
): Promise<void> {
  const context = await getAutoescolaContext(autoescolaId);
  const history = await getConversationHistory(clienteId, autoescolaId);
  
  const response = await generateAIResponse(mensagem, context, history);
  
  // Verificar se há function calling para venda
  if (response.tool_calls) {
    for (const toolCall of response.tool_calls) {
      if (toolCall.function.name === "registrar_venda") {
        const { tipo, valor } = JSON.parse(toolCall.function.arguments);
        
        await createVenda({
          autoescolaId,
          clienteId,
          tipo,
          valor,
          status: "pendente"
        });
      }
    }
  }
  
  // Salvar resposta da IA
  await saveMensagem({
    conversaId: history[0].conversaId,
    conteudo: response.content,
    remetente: "ia"
  });
}
```

---

## 📱 Integração WhatsApp

### whatsappController.ts

Webhook para receber mensagens:

```typescript
export async function handleWebhook(req: Request, res: Response) {
  // Validar token do Facebook
  const token = req.query['hub.verify_token'];
  if (token !== process.env.WHATSAPP_WEBHOOK_TOKEN) {
    return res.status(403).send('Unauthorized');
  }

  const challenge = req.query['hub.challenge'];
  res.send(challenge);
}

export async function handleMessage(req: Request, res: Response) {
  const { entry } = req.body;
  
  for (const event of entry) {
    for (const change of event.changes) {
      const { value } = change;
      
      if (value.messages) {
        for (const message of value.messages) {
          const { from, text } = message;
          
          // 1. Identificar autoescola pelo número de destino
          const autoescola = await getAutoescolaByPhoneNumber(value.metadata.phone_number_id);
          
          // 2. Buscar ou criar cliente
          let cliente = await getClienteByPhone(from, autoescola.id);
          if (!cliente) {
            cliente = await createCliente({
              autoescolaId: autoescola.id,
              telefone: from,
              nome: `Cliente ${from}`,
              status: "prospect"
            });
          }
          
          // 3. Enviar para fila de processamento
          await messageQueue.add({
            clienteId: cliente.id,
            autoescolaId: autoescola.id,
            mensagem: text.body,
            telefone: from
          });
        }
      }
    }
  }
  
  res.status(200).send('OK');
}
```

### whatsappService.ts

Envio de mensagens:

```typescript
export async function enviarMensagem(
  telefone: string,
  mensagem: string,
  autoescolaId: string
): Promise<void> {
  const autoescola = await getAutoescolaById(autoescolaId);
  
  const response = await axios.post(
    `https://graph.instagram.com/v18.0/${autoescola.whatsappBusinessId}/messages`,
    {
      messaging_product: "whatsapp",
      to: telefone,
      type: "text",
      text: { body: mensagem }
    },
    {
      headers: {
        Authorization: `Bearer ${autoescola.whatsappToken}`
      }
    }
  );
  
  return response.data;
}
```

---

## 🔄 Sistema de Filas (BullMQ + Redis)

### Processamento de Mensagens

```typescript
// server/jobs/messageProcessor.ts
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
});

const messageQueue = new Queue('messages', { connection: redis });

// Worker para processar mensagens
const worker = new Worker('messages', async (job) => {
  const { clienteId, autoescolaId, mensagem, telefone } = job.data;
  
  try {
    // Processar mensagem com IA
    await processarMensagem(mensagem, clienteId, autoescolaId);
    
    // Obter resposta da IA
    const ultimaMensagem = await getUltimaMensagem(clienteId);
    
    // Enviar resposta via WhatsApp
    await enviarMensagem(telefone, ultimaMensagem.conteudo, autoescolaId);
    
    // Salvar no Redis com TTL de 24h
    await redis.setex(
      `conversation:${clienteId}`,
      86400,
      JSON.stringify({ lastUpdate: new Date() })
    );
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    throw error; // Retry automático
  }
}, { connection: redis });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completado`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} falhou:`, err.message);
});
```

---

## 🌐 Frontend Web

### Landing Page

- Hero section com CTA
- 6 cards de recursos
- Seção "Como Funciona"
- Navegação responsiva

### Dashboard Administrativo

**Sidebar com 3 seções:**

1. **Dashboard**: 4 cards de métricas (clientes, vendas, conversas, vendas do dia)
2. **Clientes**: Tabela paginada com busca por nome/telefone/email
3. **Configurações**: Editor de system prompt e preços

---

## 📱 App Mobile (React Native + Expo)

### Telas

1. **Login**: Autenticação com email/senha
2. **Dashboard**: Métricas em cards
3. **Clientes**: Lista com busca
4. **Configurações**: System prompt e preços

### Recursos

- Bottom tab navigation
- Offline support com AsyncStorage
- Notificações push
- Integração com backend via API

---

## 🔐 Variáveis de Ambiente

### Backend (.env)

```
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

```
VITE_API_URL=https://seu-backend.com/api
VITE_OAUTH_CLIENT_ID=seu-client-id
```

### Mobile (.env)

```
EXPO_PUBLIC_API_URL=https://seu-backend.com/api
EXPO_PUBLIC_OAUTH_CLIENT_ID=seu-client-id
```

---

## 🚀 Deploy

### Backend (Cloud Run, Railway, Render)

```bash
# Build
pnpm build

# Start
pnpm start
```

### Frontend Web (Vercel, Netlify)

```bash
# Build
pnpm build

# Deploy
vercel deploy
```

### Mobile (App Store, Google Play)

```bash
# iOS
eas build --platform ios --auto-submit

# Android
eas build --platform android --auto-submit
```

---

## 🧪 Testes

```bash
# Backend
pnpm test

# Frontend
pnpm test

# Mobile
pnpm test
```

---

## 📚 Endpoints da API

### Autenticação

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuário atual

### Clientes

- `GET /api/clientes` - Listar (com paginação)
- `POST /api/clientes` - Criar
- `GET /api/clientes/:id` - Obter
- `PUT /api/clientes/:id` - Atualizar
- `DELETE /api/clientes/:id` - Deletar

### Conversas

- `GET /api/conversas` - Listar
- `GET /api/conversas/:id/mensagens` - Histórico
- `POST /api/conversas/:id/mensagens` - Enviar mensagem

### Vendas

- `GET /api/vendas` - Listar
- `POST /api/vendas` - Registrar
- `GET /api/vendas/stats` - Estatísticas

### Configurações

- `GET /api/configuracoes` - Obter
- `PUT /api/configuracoes` - Atualizar

---

## 🔒 Segurança

✅ **Implementado:**
- Isolamento multi-tenant em todas as queries
- Validação JWT em cada requisição
- Middleware de tenant obrigatório
- Rate limiting no webhook
- Input sanitization
- CORS configurado
- HTTPS obrigatório em produção

⚠️ **Próximos passos:**
- Implementar 2FA
- Audit logs
- Encryption de dados sensíveis
- Backup automático

---

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação: `/docs`
- Issues: GitHub Issues
- Email: support@autoescola-saas.com

---

**Versão**: 1.0.0  
**Última atualização**: 15 de Março de 2026  
**Status**: ✅ Pronto para produção
