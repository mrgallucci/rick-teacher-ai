# Rick Teacher AI

Projeto independente de aprendizagem de inglês básico, reconstruído a partir de um exercício antigo de programação e transformado em uma aplicação de portfólio voltada a **IA aplicada**.

## O que mudou

A versão atual não depende de geradores de aplicação, plataformas de deploy ou componentes de terceiros no frontend. A interface foi reescrita em **HTML, CSS e JavaScript puros**, podendo ser aberta diretamente pelo **VS Code Live Server**.

O tutor usa um backend local pequeno em FastAPI. A chave da API fica somente no arquivo local `backend/.env`, que é ignorado pelo Git.

## Funcionalidades

- onboarding simples com nome e objetivo;
- trilha A1 com 8 unidades;
- vocabulário, exemplos e áudio via Web Speech API;
- mini quizzes;
- XP, porcentagem de conclusão e precisão;
- persistência com LocalStorage;
- tutor contextual com LLM real;
- prompts rápidos para prática;
- interface responsiva;
- zero dependências JavaScript no frontend.

## Estrutura

```text
rick-teacher-ai/
├── index.html
├── style.css
├── curriculum.js
├── app.js
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env.example
├── .gitignore
└── README.md
```

## 1. Abrir o frontend pelo Live Server

Abra a pasta do projeto no VS Code e clique com o botão direito em `index.html` → **Open with Live Server**.

O frontend funciona sem backend para:

- trilhas;
- exercícios;
- progresso;
- LocalStorage;
- síntese de voz disponível no navegador.

O tutor de IA exibirá `offline` até o backend ser iniciado.

## 2. Configurar o tutor LLM

No PowerShell, dentro da pasta `backend`:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Abra `backend/.env` e coloque sua chave:

```env
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-5.6-luna
```

Nunca envie `.env` para o GitHub.

## 3. Iniciar o backend

Ainda dentro de `backend`:

```powershell
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

Depois atualize a página aberta pelo Live Server. O indicador no topo deverá mudar para **Tutor IA conectado**.

## Arquitetura

```text
Live Server (HTML/CSS/JS)
        ↓ HTTP local
FastAPI em 127.0.0.1:8000
        ↓
OpenAI Responses API
        ↓
Resposta contextual para o aluno
```

## Por que existe um backend?

A chave de uma API de IA não deve ser colocada no JavaScript entregue ao navegador. Por isso o frontend pode ser totalmente estático, mas o acesso ao LLM passa por um servidor local mínimo.

## Direção do projeto

O conteúdo curricular permanece determinístico e previsível. O LLM é usado onde agrega valor: explicações, correção de frases, geração de exemplos e prática contextual. Isso reduz dependência do modelo para tarefas que não precisam ser generativas e deixa mais clara a arquitetura de IA aplicada.

## Próximas evoluções possíveis

- avaliação de escrita com critérios estruturados;
- histórico de erros recorrentes;
- recomendação adaptativa da próxima lição;
- geração de exercícios por dificuldade;
- autenticação real e persistência em banco de dados;
- deploy independente do frontend e da API.

## Autor

**Maxwell Gallucci Rodrigues**

Projeto reconstruído para estudo e portfólio profissional.
