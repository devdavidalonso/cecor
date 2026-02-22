# 📨 Estratégia de Comunicação CECOR - Email, Telegram e In-APP

**Data:** 21/02/2026  
**Canais:** Email (obrigatório) + Telegram (opcional) + In-APP (forçado)  
**Objetivo:** Mapear gatilhos e definir estratégia omnichannel

---

## 🎯 VISÃO GERAL DA ESTRATÉGIA

```
┌─────────────────────────────────────────────────────────────────┐
│                    PIRÂMIDE DE COMUNICAÇÃO                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     🔴 URGENTE (Imediato - Todos os canais)                    │
│     └── Cancelamento de aula, Ausência professor               │
│         Email + Telegram + Push In-APP + Badge vermelho        │
│                                                                 │
│     🟡 IMPORTANTE (Até 1h - Dois canais)                       │
│     └── Lembrete de aula, Substituição professor               │
│         Telegram + In-APP (ou Email se não tiver Telegram)     │
│                                                                 │
│     🟢 INFORMATIVO (Dentro do APP)                             │
│     └── Frequência registrada, Nova matrícula                  │
│         In-APP obrigatório + Email resumo semanal              │
│                                                                 │
│     ⚪ OPCIONAL (Ver quando quiser)                            │
│     └── Boletim mensal, Promoções                              │
│         Email semanal + In-APP (não força)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 MAPEAMENTO COMPLETO DE GATILHOS

### 1️⃣ MÓDULO: ALUNOS E MATRÍCULAS

| Gatilho | Prioridade | Email | Telegram | In-APP | Forçar In-APP? |
|---------|------------|-------|----------|--------|----------------|
| **Matrícula confirmada** | 🟢 | ✅ | ✅ | ✅ | ✅ (tela sucesso) |
| **Matrícula em espera** | 🟡 | ✅ | ✅ | ✅ | ✅ (alerta) |
| **Vaga liberada (lista espera)** | 🔴 | ✅ | ✅ | ✅ | ✅ (push + badge) |
| **Documento pendente** | 🟡 | ✅ | ❌ | ✅ | ✅ (banner) |
| **Entrevista agendada** | 🟡 | ✅ | ✅ | ✅ | ✅ (modal) |
| **Entrevista confirmada** | 🟢 | ✅ | ❌ | ✅ | ❌ |
| **Certificado disponível** | 🟢 | ✅ | ✅ | ✅ | ✅ (notificação) |
| **Cancelamento de matrícula** | 🟡 | ✅ | ❌ | ✅ | ✅ (confirmação) |

**Exemplo - Matrícula Confirmada:**
```
┌─ IN-APP (Forçado) ─┐  ┌─ TELEGRAM ─┐  ┌─ EMAIL ─┐
│ 🎉 PARABÉNS!       │  │ 🎉 CECOR   │  │ Assunto: │
│                    │  │            │  │ Bem-vindo│
│ Você foi matricu-  │  │ Matrícula  │  │ ao CECOR!│
│ lado em Inglês     │  │ confirmada │  │          │
│ Básico - Turma A   │  │            │  │ Detalhes │
│                    │  │ Curso:     │  │ completos│
│ [📅 Ver Calendário]│  │ Inglês     │  │ do curso │
│ [👨‍🏫 Ver Professor] │  │ Turma: 2026A│ │ e próximos│
│                    │  │            │  │ passos...│
│ ⚠️ Atenção: Leia   │  │ Próxima    │  │          │
│ as regras antes    │  │ aula: 24/02│  │ [Acessar │
│ da primeira aula   │  │            │  │ Portal]  │
└────────────────────┘  └────────────┘  └──────────┘
```

---

### 2️⃣ MÓDULO: AULAS E FREQUÊNCIA

| Gatilho | Prioridade | Email | Telegram | In-APP | Forçar In-APP? |
|---------|------------|-------|----------|--------|----------------|
| **Lembrete 24h antes da aula** | 🟡 | ❌ | ✅ | ✅ | ❌ |
| **Lembrete 1h antes da aula** | 🟡 | ❌ | ✅ | ✅ | ❌ |
| **Aula cancelada (professor)** | 🔴 | ✅ | ✅ | ✅ | ✅ (modal bloqueante) |
| **Substituição de professor** | 🟡 | ✅ | ✅ | ✅ | ✅ (badge) |
| **Frequência registrada** | 🟢 | ❌ | ❌ | ✅ | ✅ (timeline atualiza) |
| **Frequência baixa (< 75%)** | 🟡 | ✅ | ✅ | ✅ | ✅ (alerta fixo) |
| **Falta justificada aprovada** | 🟢 | ✅ | ❌ | ✅ | ✅ (notificação) |
| **Falta justificada recusada** | 🟡 | ✅ | ✅ | ✅ | ✅ (modal) |

**Exemplo - Frequência Baixa (Alerta Crítico):**
```
┌─ IN-APP (FORÇADO - Banner Fixo) ─┐
│                                   │
│  ⚠️ ATENÇÃO: FREQUÊNCIA BAIXA    │
│                                   │
│  Sua frequência em Inglês         │
│  Básico está em 68% (mínimo: 75%) │
│                                   │
│  ❗ Risco de reprovação/falta     │
│     de certificado               │
│                                   │
│  [📊 Ver Detalhes] [📞 Contatar  │
│   Coordenação]                    │
│                                   │
│  ✕ Entendi (continua visível)     │
│                                   │
└───────────────────────────────────┘

┌─ TELEGRAM ─┐
│ ⚠️ CECOR   │
│            │
│ Frequência │
│ baixa!     │
│            │
│ Curso:     │
│ Inglês 68% │
│            │
│ Entre em   │
│ contato    │
│ com a      │
│ coordenação│
└────────────┘
```

---

### 3️⃣ MÓDULO: PROFESSORES

| Gatilho | Prioridade | Email | Telegram | In-APP | Forçar In-APP? |
|---------|------------|-------|----------|--------|----------------|
| **Nova turma atribuída** | 🟢 | ✅ | ✅ | ✅ | ✅ (tela boas-vindas) |
| **Lembrete registro presença** | 🟡 | ❌ | ✅ | ✅ | ✅ (badge) |
| **Substituição solicitada** | 🔴 | ✅ | ✅ | ✅ | ✅ (modal resposta) |
| **Substituição confirmada** | 🟡 | ✅ | ✅ | ✅ | ✅ (push) |
| **Nova ocorrência registrada** | 🟢 | ✅ | ❌ | ✅ | ✅ (badge) |
| **Resposta a ocorrência** | 🟢 | ✅ | ✅ | ✅ | ❌ |
| **Aviso de frequência baixa (aluno)** | 🟡 | ❌ | ❌ | ✅ | ✅ (alerta turma) |
| **Termo de voluntariado vencendo** | 🟡 | ✅ | ✅ | ✅ | ✅ (banner) |

**Exemplo - Substituição (URGENTE):**
```
┌─ IN-APP (FORÇADO - Modal Bloqueante) ─┐
│                                        │
│  🔄 SOLICITAÇÃO DE SUBSTITUIÇÃO        │
│                                        │
│  Ana Silva está ausente e você foi     │
│  selecionado para substituir:          │
│                                        │
│  📘 Inglês Básico - Turma A            │
│  📅 Segunda, 24/02 às 19:00            │
│  📍 Sala 2                             │
│  📝 Tema: "Saudações"                  │
│                                        │
│  ⚠️ POR FAVOR, CONFIRME SUA            │
│     DISPONIBILIDADE:                   │
│                                        │
│  [✓ POSSO DAR AULA]                    │
│  [❌ NÃO POSSO]                        │
│                                        │
│  ⏰ Responder em até 2h                │
│                                        │
└────────────────────────────────────────┘

┌─ TELEGRAM ─┐
│ 🔄 CECOR   │
│            │
│ SUBSTITUI- │
│ ÇÃO        │
│ URGENTE!   │
│            │
│ Inglês     │
│ Básico     │
│ 24/02 19h  │
│            │
│ [✓ Aceitar]│
│ [✗ Recusar]│
└────────────┘
```

---

### 4️⃣ MÓDULO: ADMINISTRAÇÃO/COORDENAÇÃO

| Gatilho | Prioridade | Email | Telegram | In-APP | Forçar In-APP? |
|---------|------------|-------|----------|--------|----------------|
| **Nova matrícula (resumo diário)** | 🟢 | ✅ | ❌ | ✅ | ❌ |
| **Professor faltou (não avisou)** | 🔴 | ✅ | ✅ | ✅ | ✅ (push) |
| **Professor registrou presença** | ⚪ | ❌ | ❌ | ✅ | ❌ |
| **Frequência baixa (alerta coordenação)** | 🟡 | ✅ | ✅ | ✅ | ✅ (dashboard) |
| **Ocorrência grave** | 🔴 | ✅ | ✅ | ✅ | ✅ (modal) |
| **Conflito de sala** | 🔴 | ✅ | ✅ | ✅ | ✅ (alerta) |
| **Limite de vagas (espera)** | 🟡 | ✅ | ❌ | ✅ | ✅ (badge) |
| **Relatório semanal** | ⚪ | ✅ | ❌ | ❌ | ❌ |

---

### 5️⃣ MÓDULO: SISTEMA E SEGURANÇA

| Gatilho | Prioridade | Email | Telegram | In-APP | Forçar In-APP? |
|---------|------------|-------|----------|--------|----------------|
| **Novo login (dispositivo)** | 🟡 | ✅ | ✅ | ❌ | N/A |
| **Senha alterada** | 🟡 | ✅ | ✅ | ❌ | N/A |
| **Dados atualizados** | ⚪ | ✅ | ❌ | ✅ | ❌ |
| **Manutenção programada** | 🟡 | ✅ | ✅ | ✅ | ✅ (banner) |
| **Nova funcionalidade** | ⚪ | ✅ | ❌ | ✅ | ❌ |

---

## 🔧 ESTRATÉGIA: FORÇAR IN-APP

### Como "Forçar" o Usuário a Ver In-APP?

#### 1. **Modal Bloqueante (Para URGENTE)**
```typescript
// Só fecha quando interagir
openBlockingModal({
  id: 'substituicao-123',
  title: 'Substituição Urgente',
  content: '...',
  allowDismiss: false,  // ❌ Não pode fechar sem ação
  actions: ['aceitar', 'recusar']
});
```

#### 2. **Badge/Persistente (Para IMPORTANTE)**
```typescript
// Fica visível até resolver
notificationCenter.addPersistent({
  id: 'freq-baixa-456',
  type: 'warning',
  title: 'Frequência Baixa',
  dismissible: false,  // ❌ Não pode dismiss
  action: '/aluno/frequencia'
});
```

#### 3. **Redirecionamento Pós-Login**
```typescript
// Quando loga, se tem notificação importante:
if (hasUrgentNotification(user)) {
  router.navigate('/notificacoes/urgentes');
} else {
  router.navigate('/dashboard');
}
```

#### 4. **Banner Fixo no Topo**
```css
.persistent-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: #ff5722;
  color: white;
  padding: 12px;
  text-align: center;
}
```

---

## 📱 IMPLEMENTAÇÃO TELEGRAM

### 1. Configuração do Bot

```bash
# 1. Criar bot via @BotFather
# 2. Receber token (ex: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)
# 3. Salvar em variável de ambiente
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 2. Models (Backend)

```go
// backend/internal/models/notification.go

// NotificationChannel - Canais de comunicação do usuário
type NotificationChannel struct {
    ID           uint       `json:"id" gorm:"primaryKey"`
    UserID       uint       `json:"userId" gorm:"not null;index"`
    Type         string     `json:"type" gorm:"not null"` // email, telegram, push
    
    // Email
    Email        string     `json:"email,omitempty"`
    
    // Telegram
    TelegramChatID   string `json:"telegramChatId,omitempty"`
    TelegramUsername string `json:"telegramUsername,omitempty"`
    TelegramVerified bool   `json:"telegramVerified" gorm:"default:false"`
    
    Active       bool       `json:"active" gorm:"default:true"`
    Verified     bool       `json:"verified" gorm:"default:false"`
    CreatedAt    time.Time  `json:"createdAt" gorm:"autoCreateTime"`
    UpdatedAt    time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
}

// NotificationPreference - Preferências por tipo de notificação
type NotificationPreference struct {
    ID              uint   `json:"id" gorm:"primaryKey"`
    UserID          uint   `json:"userId" gorm:"not null;index"`
    
    // Tipo de notificação
    EventType       string `json:"eventType" gorm:"not null"` // enrollment, attendance, substitute, etc.
    
    // Canais (JSON: {"email": true, "telegram": true, "inapp": true})
    Channels        string `json:"channels" gorm:"type:json;not null"`
    
    // Prioridade mínima para notificar
    MinPriority     string `json:"minPriority" gorm:"default:'medium'"` // low, medium, high, urgent
    
    Active          bool   `json:"active" gorm:"default:true"`
    CreatedAt       time.Time `json:"createdAt" gorm:"autoCreateTime"`
}
```

### 3. Serviço de Notificação

```go
// backend/internal/service/notifications/service.go

package notifications

type Service interface {
    SendNotification(ctx context.Context, req SendRequest) error
    SendToUser(ctx context.Context, userID uint, notification Notification) error
    SendToCourse(ctx context.Context, courseClassID uint, notification Notification) error
    SendToGroup(ctx context.Context, groupID string, notification Notification) error
}

type SendRequest struct {
    UserIDs         []uint          // Destinatários
    EventType       string          // Tipo do evento
    Title           string          // Título
    Message         string          // Mensagem
    Priority        string          // low, medium, high, urgent
    Data            map[string]interface{} // Dados extras
    ActionURL       string          // Link para ação
    ForceInApp      bool            // Forçar visualização in-app
}

type service struct {
    db              *gorm.DB
    emailService    email.Service
    telegramService telegram.Service
    inAppService    inapp.Service
}

func (s *service) SendNotification(ctx context.Context, req SendRequest) error {
    for _, userID := range req.UserIDs {
        // 1. Buscar preferências do usuário
        prefs, err := s.getUserPreferences(userID, req.EventType)
        if err != nil {
            continue
        }
        
        // 2. Verificar se prioridade atinge o mínimo
        if !s.shouldNotify(req.Priority, prefs.MinPriority) {
            continue
        }
        
        // 3. Enviar por cada canal ativo
        channels := parseChannels(prefs.Channels)
        
        // IN-APP (sempre envia, mas marca se força ou não)
        s.inAppService.Send(ctx, userID, inapp.Message{
            Title:      req.Title,
            Message:    req.Message,
            Priority:   req.Priority,
            ForceView:  req.ForceInApp,
            ActionURL:  req.ActionURL,
        })
        
        // EMAIL
        if channels.Email && req.Priority != "low" {
            s.emailService.Send(ctx, userID, email.Message{
                Subject: req.Title,
                Body:    req.Message,
                // ...
            })
        }
        
        // TELEGRAM
        if channels.Telegram {
            s.telegramService.Send(ctx, userID, telegram.Message{
                Text:       formatTelegramMessage(req),
                ParseMode:  "HTML",
                Buttons:    formatTelegramButtons(req),
            })
        }
    }
    
    return nil
}

func formatTelegramMessage(req SendRequest) string {
    emoji := map[string]string{
        "urgent": "🚨",
        "high":   "⚠️",
        "medium": "ℹ️",
        "low":    "📌",
    }
    
    return fmt.Sprintf(`
%s <b>%s</b>

%s

<i>Acesse o portal para mais detalhes</i>
    `, emoji[req.Priority], req.Title, req.Message)
}
```

### 4. Serviço Telegram Específico

```go
// backend/internal/service/notifications/telegram.go

package notifications

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

type TelegramService struct {
    botToken string
    apiURL   string
}

func NewTelegramService(botToken string) *TelegramService {
    return &TelegramService{
        botToken: botToken,
        apiURL:   fmt.Sprintf("https://api.telegram.org/bot%s", botToken),
    }
}

func (s *TelegramService) Send(ctx context.Context, chatID string, msg Message) error {
    url := fmt.Sprintf("%s/sendMessage", s.apiURL)
    
    payload := map[string]interface{}{
        "chat_id":    chatID,
        "text":       msg.Text,
        "parse_mode": msg.ParseMode, // HTML ou Markdown
    }
    
    // Adicionar botões se houver
    if len(msg.Buttons) > 0 {
        payload["reply_markup"] = map[string]interface{}{
            "inline_keyboard": formatButtons(msg.Buttons),
        }
    }
    
    jsonPayload, _ := json.Marshal(payload)
    
    resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonPayload))
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    return nil
}

// Botão com callback para ações diretas no Telegram
func (s *TelegramService) SendWithCallback(ctx context.Context, chatID string, msg Message) error {
    // Exemplo: Botão "Confirmar Presença" que já registra no sistema
    buttons := [][]map[string]string{
        {
            {"text": "✓ Confirmar", "callback_data": "confirm:123"},
            {"text": "✗ Recusar", "callback_data": "decline:123"},
        },
    }
    
    // ...
}

// Como obter o chat_id?
func (s *TelegramService) GetChatID(ctx context.Context, username string) (string, error) {
    // O usuário precisa primeiro enviar /start para o bot
    // Depois, pegamos o update via webhook ou polling
    
    url := fmt.Sprintf("%s/getUpdates", s.apiURL)
    resp, err := http.Get(url)
    // Parse response procurando pelo username
    // Retorna chat_id
}
```

### 5. Setup do Bot no Telegram

```
PASSO A PASSO PARA CONFIGURAR:

1. ABRIR TELEGRAM
   └── Buscar @BotFather

2. CRIAR BOT
   └── Enviar: /newbot
   └── Escolher nome: "CECOR Notificações"
   └── Escolher username: "cecor_bot"
   └── Receber token: 123456789:ABCdef...

3. CONFIGURAR BOT
   └── /setdescription - Descrição do bot
   └── /setcommands - Lista de comandos:
       start - Iniciar e vincular conta
       perfil - Ver meus dados
       parar - Parar notificações

4. OBTER CHAT_ID
   └── Usuário envia /start para @cecor_bot
   └── Sistema captura chat_id via webhook
   └── Salva em notification_channels

5. WEBHOOK (opcional, para produção)
   └── /setWebhook https://api.cecor.org/telegram/webhook
   └── Sistema recebe mensagens em tempo real
```

---

## 📊 RESUMO DA ESTRATÉGIA

### Matrix de Decisão

```
┌─────────────────┬───────────────┬─────────────┬──────────┬────────────┐
│     Evento      │    Email      │  Telegram   │  In-APP  │   Forçar   │
├─────────────────┼───────────────┼─────────────┼──────────┼────────────┤
│ Urgente         │ ✅            │ ✅          │ ✅       │ ✅ Modal   │
│                 │ (todos)       │ (se tiver)  │ (badge)  │ (bloqueia) │
├─────────────────┼───────────────┼─────────────┼──────────┼────────────┤
│ Importante      │ ✅            │ ✅          │ ✅       │ ✅ Banner  │
│                 │ (se não TG)   │ (preferido) │ (badge)  │ (persiste) │
├─────────────────┼───────────────┼─────────────┼──────────┼────────────┤
│ Informativo     │ ❌            │ ❌          │ ✅       │ ❌         │
│                 │               │             │ (lista)  │            │
├─────────────────┼───────────────┼─────────────┼──────────┼────────────┤
│ Resumo          │ ✅            │ ❌          │ ❌       │ N/A        │
│                 │ (semanal)     │             │          │            │
└─────────────────┴───────────────┴─────────────┴──────────┴────────────┘
```

### Fluxo de Decisão (Algoritmo)

```go
func DecideChannels(event Event, user User) Channels {
    // 1. SEMPRE envia In-APP
    channels := Channels{InApp: true}
    
    // 2. URGENTE = todos os canais
    if event.Priority == "urgent" {
        channels.Email = true
        channels.Telegram = user.HasTelegram()
        channels.ForceInApp = true
        return channels
    }
    
    // 3. IMPORTANTE = Telegram (se tiver) ou Email
    if event.Priority == "high" {
        if user.HasTelegram() {
            channels.Telegram = true
        } else {
            channels.Email = true
        }
        channels.ForceInApp = true
        return channels
    }
    
    // 4. INFORMATIVO = só In-APP
    if event.Priority == "medium" {
        channels.ForceInApp = false
        return channels
    }
    
    // 5. BAIXO = só In-APP, não força
    channels.InApp = false // Só aparece na lista
    return channels
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Setup Telegram (2h)
- [ ] Criar bot no @BotFather
- [ ] Salvar token em variável de ambiente
- [ ] Criar tabela notification_channels
- [ ] Criar tabela notification_preferences

### Fase 2: Backend (8h)
- [ ] Serviço TelegramService
- [ ] Serviço NotificationService (orquestrador)
- [ ] Endpoints para configurar notificações
- [ ] Webhook para receber mensagens do Telegram

### Fase 3: Frontend (6h)
- [ ] Tela de configuração de notificações
- [ ] Componente NotificationCenter (In-APP)
- [ ] Modal bloqueante para urgentes
- [ ] Banner persistente para importantes

### Fase 4: Gatilhos (4h)
- [ ] Integrar nos eventos existentes
- [ ] Testar cada cenário
- [ ] Ajustar preferências padrão

---

## 💰 CUSTOS

| Canal | Custo | Observação |
|-------|-------|------------|
| **Email** | R$ 0 - R$ 50/mês | SendGrid free tier (100/dia) ou AWS SES |
| **Telegram** | **R$ 0** | Totalmente gratuito |
| **In-APP** | R$ 0 | Próprio sistema |
| **Total** | **R$ 0 - R$ 50/mês** | Depende de volume de email |

---

**Documento criado em:** 21/02/2026  
**Próxima ação:** Implementar serviço de notificações com Telegram
