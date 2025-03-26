# TCC - Sistema de Monitoramento Aquapônico

## Descrição

Sistema avançado de monitoramento para aquaponia baseado em IoT que utiliza tecnologias inteligentes para capturar, analisar e processar dados do ecossistema, com gerenciamento de equipamentos e insights em tempo real.

## Tecnologias

### Frontend
- React.js com TypeScript
- Tailwind CSS
- Componentes de UI baseados em Shadcn
- Visualização de dados em tempo real com Recharts

### Backend
- Node.js com Express
- Armazenamento em SQLite
- Manipulação avançada de estados
- Integração com ThingSpeak

### IoT
- Integração com plataforma ThingSpeak
- Emulação virtual de sensores
- Sincronização de estados de equipamentos

### Recursos
- Monitoramento de temperatura e nível de água em tempo real
- Controle de equipamentos (bomba e aquecedor)
- Análise de dados históricos
- Alertas e notificações para valores críticos
- Interface responsiva e intuitiva

## Instalação

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

## Configuração

Configure as variáveis de ambiente no arquivo `.env`:

```
THINGSPEAK_READ_API_KEY=sua_chave_aqui
THINGSPEAK_WRITE_API_KEY=sua_chave_aqui
THINGSPEAK_CHANNEL_ID=seu_canal_aqui
```

## Estrutura do Projeto

- `/client` - Frontend React
- `/server` - Backend Express
- `/shared` - Schemas e tipos compartilhados
- `/server/services` - Serviços de integração e lógica de negócios

## Licença

MIT