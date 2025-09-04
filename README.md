# 🦷 OdontoChat Assistant (clinic-chat-automation)

WhatsApp **chatbot** para **clínicas odontológicas**, com painel web da recepção e automações de confirmação de consulta. Este repositório contém:
- **dump/**: export do **banco de dados** (MySQL) para restauração rápida.
- **3 funções Lambda** (cada uma em sua pasta) que compõem o backend serverless.
- **UI estática** (página da recepcionista e calendário do paciente) hospedável no **Amazon S3**.

> Objetivo: **reduzir trabalho manual** (agendamentos, reagendamentos, confirmações e relatórios) e melhorar a experiência do paciente no WhatsApp.

---

## ✨ Principais recursos

- 🤖 Chatbot no **WhatsApp** (pré‑cadastro, 1ª consulta, reagendamento).
- 🖥 **Painel da recepcionista** (agendamentos em tempo real, clientes, pendências de confirmação).
- ⏰ **Mensagens automáticas** (ex.: 12h antes da consulta).
- 💾 Armazenamento de **encaminhamentos/relatórios** no **Amazon S3**.
- 💰 **Otimização de custos** (desligamento noturno via EventBridge+Lambda).
- 🔒 Boas práticas: uso de variáveis de ambiente e IAM.

---

## 🗂 Estrutura do projeto

A pasta base possui as seguintes subpastas, com suas respectivas funções:

```
clinic-chat-automation/
├─ Dump04092025/                  # Banco de dados (MySQL) - são vários arquivos .sql cada um uma tabela separada.
│  └─ outro_arquivo.sql
├─ chatbot/                      # Backend chatbot (API, WhatsApp Platform integration)
│  ├─ API/
│  ├─ WPP/
│  ├─ Code/
│  ├─ DB/
│  ├─ index.js
│  └─ package.json
├─ uicalendario/                 # Interface do calendário com backend (index.js) e banco de dados JS
│  ├─ bd/
│  │  ├─ agendamento.js
│  │  ├─ cliente.js
│  │  └─ utils.js
│  ├─ index.js
│  └─ package.json
└─ uiodontologia/                # UI odontologia com backend (index.js) e banco de dados JS
   ├─ bd/
   │  ├─ connectionBD.js
   │  └─ idusuario.js
   └─ index.js
```

> **Importante**: cada Lambda é **subida separadamente** na AWS.

---

## 🧰 Pré‑requisitos

- Conta AWS com permissões para: **Lambda**, **API Gateway**, **RDS (MySQL)**, **S3**, **EventBridge**, **IAM**.
- **Node.js 18+** e **npm** instalados localmente.
- Acesso ao **WhatsApp Business Platform (Meta)** para configurar **Webhook** e **Verify Token**.
- **Git** instalado.

---

## 🔑 Variáveis de ambiente (exemplo)

Crie um arquivo `.env` (não versione esse arquivo). As variáveis serão definidas **em cada Lambda** também (via Console/CLI).

```
# Banco
DB_HOST=seu-endpoint-rds.rds.amazonaws.com
DB_PORT=3306
DB_USER=usuario
DB_PASSWORD=senha
DB_NAME=odontochat

# WhatsApp Business (Meta)
META_VERIFY_TOKEN=sua-palavra-secreta-de-verificacao
META_WABA_PHONE_NUMBER_ID=123456789012345
META_GRAPH_API_VERSION=v20.0
META_APP_ID=...
META_APP_SECRET=...
META_ACCESS_TOKEN=EAA... (token de longo prazo)

# S3
S3_BUCKET_RELATORIOS=odonto-relatorios-bucket

# Diversos
TZ=America/Sao_Paulo
STAGE=prod
```

> **Nunca** commit `.env`, chaves, tokens ou secrets. Use **IAM Roles** e **AWS Secrets Manager** em produção.

---

## 🗄️ Banco de dados (MySQL)

1) **Crie o banco** no RDS (ou local):
```sql
CREATE DATABASE odontochat;
```

2) **Restaure o dump**:
```bash
# Local
mysql -u root -p odontochat < dump/full.sql

# Ou direto no RDS (cuidado com IP/segurança)
mysql -h SEU_ENDPOINT -u SEU_USUARIO -p odontochat < dump/full.sql
```

---

## ☁️ Deploy das Lambdas

Cada função Lambda precisa ser empacotada e publicada **separadamente**. Abaixo, dois caminhos: **Console AWS** ou **CLI**.

### A) Via Console - será mais rápido

Para cada pasta de Lambda (ex.: `lambda-whatsapp-webhook`):

1. Instale dependências:
   ```bash
   cd lambda-whatsapp-webhook
   npm ci
   zip -r ../lambda-whatsapp-webhook.zip .
   ```
2. No **AWS Console** → **Lambda** → **Create function** → *Author from scratch*.
3. Runtime: **Node.js 18.x**. Crie a função (ex.: `odonto-whatsapp-webhook`).
4. Em **Code** → **Upload from** → **.zip file** → envie `lambda-whatsapp-webhook.zip`.
5. Em **Configuration → Environment variables**, adicione as **variáveis de ambiente**.
6. Em **Permissions**, garanta a **Role** com políticas mínimas necessárias (acesso ao RDS/S3/CloudWatch).
7. Repita o processo para `lambda-scheduler` e `lambda-admin-api`.

### B) Via AWS CLI (automatizável)

```bash
# 1) Webhook (recebe eventos da Meta)

cd lambda-whatsapp-webhook
npm ci
zip -r ../lambda-whatsapp-webhook.zip .
aws lambda create-function \
  --function-name odonto-whatsapp-webhook \
  --runtime nodejs18.x \
  --role arn:aws:iam::SEU_ACCOUNT_ID:role/RoleLambdaOdonto \
  --handler index.handler \
  --timeout 30 \
  --memory-size 512 \
  --zip-file fileb://../lambda-whatsapp-webhook.zip

# Definir variáveis de ambiente
aws lambda update-function-configuration \
  --function-name odonto-whatsapp-webhook \
  --environment "Variables={DB_HOST=...,DB_USER=...,DB_PASSWORD=...,DB_NAME=...,META_VERIFY_TOKEN=...,META_ACCESS_TOKEN=...,META_WABA_PHONE_NUMBER_ID=...,META_GRAPH_API_VERSION=v20.0,S3_BUCKET_RELATORIOS=...,TZ=America/Sao_Paulo,STAGE=prod}"
```

> Repita para as outras duas funções (`lambda-scheduler` e `lambda-admin-api`) trocando `--function-name` e o `.zip`.

---

## 🌐 API Gateway (endpoints)

Crie duas APIs HTTP/REST:

- **/webhook** → integra com `odonto-whatsapp-webhook`  
  - Método **GET**: verificação de token da Meta (challenge).
  - Método **POST**: recebimento de mensagens/eventos do WhatsApp.

- **/admin/** → integra com `lambda-admin-api`  
  - Exemplos:
    - `GET /admin/agendamentos?data=YYYY-MM-DD`
    - `POST /admin/agendamentos` (criar)
    - `GET /admin/clientes/:id`

> Ative **CORS** na API do `/admin` para liberar a UI do S3.

---

## 🧷 Configuração na Meta (WhatsApp Business Platform)

1. No **Developers Facebook** → app da Meta → **WhatsApp**.
2. Em **Webhook**:
   - **Callback URL**: a URL pública do API Gateway (`/webhook`).
   - **Verify Token**: o mesmo valor de `META_VERIFY_TOKEN`.
3. **Subscribe** aos eventos relevantes (messages, message_status).
4. Configure o **Phone Number ID** e gere o **Access Token** (pode ser o token temporário, porém melhor se for o permanente)
5. Faça um **test message** para validar o fluxo.

---

## 📅 EventBridge (mensagens automáticas e economia)

- **Regra 1 (Lembrete 12h antes)** → cron que chama `lambda-scheduler` periodicamente (ex.: a cada 10 min) para buscar consultas futuras e disparar mensagem.
- **Regra 2 (Modo economia)** → cron noturno para pausar/retomar rotinas (se aplicável) e reduzir consumo.

Exemplo de cron de 10 em 10 min (UTC):
```
cron(0/10 * * * ? *)
```

---

## 🗃 Hospedagem da UI (S3 + opcional CloudFront)

1. **Crie um bucket S3** (ex.: `odonto-ui-site`) com **static website hosting** habilitado.
2. Faça upload do conteúdo de `web-ui/`.
3. Se usar **CloudFront**, associe o bucket, configure **OAC** e **política de acesso**.
4. Ajuste as URLs da API (`/admin`) no JS da UI, conforme o domínio do API Gateway/CloudFront.

---

## 🧪 Testes locais rápidos

Para testar handlers localmente (ex.: com `serverless-offline` ou um script simples):

```bash
cd lambda-whatsapp-webhook
npm test
node index.js  # se o handler tiver runner local
```

> Em ambiente local, use **MySQL local** (Docker: `mysql:8`) e tokens **sandbox** da Meta.

---

## 👮 Segurança

- Use **IAM Role** por função Lambda (princípio do privilégio mínimo).
- Nunca exponha tokens/secrets no código. Preferir **Secrets Manager**.
- Ative **CloudWatch Logs** e monitore erros/latências.
- Restrinja o acesso ao **RDS** (subnet privada + SGs) quando for produção.

---

## 💸 Custos & otimização

- Serverless reduz custo ocioso.  
- EventBridge + desligamento noturno evita rotinas desnecessárias.  
- S3 + CloudFront para a UI é barato e escalável.

---

## 🧭 Roadmap (idéias)

- Catálogo de procedimentos com tempo médio e preço.
- Lembrete com **rich messages** (botões de confirmar/remarcar).
- Export CSV/PDF de relatórios mensais.
- Multi-clínica (multi-tenant) com isolamento por schema.

---

## ▶️ Resumo

1. **Baixe/clonar** esta pasta do GitHub.
2. Dentro dela, você verá **4 pastas**: `dump/` + **3 Lambdas** (`lambda-whatsapp-webhook/`, `lambda-scheduler/`, `lambda-admin-api/`).
3. **Crie o banco** (RDS MySQL) e **importe** `dump/full.sql`.
4. **Publique cada Lambda separadamente** (Console ou CLI) e defina **variáveis de ambiente**.
5. **Crie o API Gateway** para `POST/GET /webhook` (Meta) e `/admin/*` (recepção).
6. **Configure o Webhook da Meta** (Callback URL + Verify Token + Access Token).
7. **Publique a UI** no **S3** e ajuste as URLs da API.
8. **Crie regras do EventBridge** para lembretes e economia de custo.
9. **Teste** (envie mensagem de teste no WhatsApp e valide fluxo).

**Com um token válido e o webhook configurado**, banco criado e Lambdas no ar, **já roda**. 🚀

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License**. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👤 Autor

**Gabriel William de Paulo**  
Desenvolvedor Node.js + AWS • [LinkedIn](https://www.linkedin.com/in/gabrielwilliamdepaulo) • [gawilab.com](https://gawilab.com)
