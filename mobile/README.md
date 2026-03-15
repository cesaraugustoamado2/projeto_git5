# Autoescola SaaS - Aplicativo Mobile

Aplicativo nativo para iOS e Android desenvolvido com React Native + Expo. Oferece acesso completo ao dashboard administrativo, gestão de clientes e configurações da IA vendedora.

## 🚀 Recursos

- **Dashboard com Métricas**: Visualize clientes, vendas e conversas em tempo real
- **Gestão de Clientes**: Busca, listagem e gerenciamento de clientes
- **Configurações da IA**: Edite system prompt e preços dos serviços
- **Autenticação**: Login seguro com token JWT
- **Notificações Push**: Receba alertas de novas mensagens
- **Offline Support**: Acesse dados em modo offline com sincronização automática

## 📋 Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (Mac)
- Android: Android Studio

## 🛠️ Instalação

```bash
# Instalar dependências
pnpm install

# Iniciar o servidor de desenvolvimento
pnpm start

# Para iOS
pnpm ios

# Para Android
pnpm android

# Para Web
pnpm web
```

## 📁 Estrutura do Projeto

```
autoescola-saas-mobile/
├── app/
│   ├── (auth)/          # Telas de autenticação
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── _layout.tsx
│   ├── (app)/           # Telas do app autenticado
│   │   ├── dashboard.tsx
│   │   ├── clientes.tsx
│   │   ├── configuracoes.tsx
│   │   └── _layout.tsx
│   └── _layout.tsx      # Layout raiz
├── lib/
│   ├── api.ts           # Cliente HTTP
│   └── store.ts         # Estado global (Zustand)
├── components/          # Componentes reutilizáveis
├── app.json             # Configuração do Expo
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 Integração com Backend

O app se conecta ao backend via API REST. Configure a URL do backend no arquivo `lib/api.ts`:

```typescript
const API_BASE_URL = 'https://seu-backend.com/api';
```

## 🔐 Autenticação

O app usa OAuth Manus para autenticação. Tokens JWT são armazenados localmente em AsyncStorage.

## 📱 Distribuição

### iOS

```bash
# Build para App Store
eas build --platform ios --auto-submit
```

### Android

```bash
# Build para Google Play
eas build --platform android --auto-submit
```

## 🧪 Testes

```bash
# Executar testes
pnpm test
```

## 📚 Documentação

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Expo Router](https://docs.expo.dev/routing/introduction/)

## 📝 Licença

MIT

## 👥 Suporte

Para suporte, entre em contato com o time de desenvolvimento.
