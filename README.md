# Rick Teacher AI

Aplicação para praticar nomes de cores em inglês por meio de reconhecimento de voz, com pontuação, níveis e acompanhamento de desempenho.

Evolução do [Rick Teacher original](https://github.com/mrgallucci/Rick-Teacher), desenvolvida com apoio do Emergent como parte da minha trajetória em desenvolvimento e inteligência artificial aplicada.

## Objetivo

Explorar uma experiência interativa de aprendizado de vocabulário, combinando reconhecimento de voz, feedback visual e progressão de dificuldade.

O reconhecimento compara a transcrição da fala com o nome esperado da cor. Não se trata de uma avaliação especializada de pronúncia.

## Funcionalidades

- Identificação do jogador pelo nome.
- Reconhecimento de voz configurado para inglês.
- Modo de jogo com pontuação por acertos e erros.
- Modo de treino sem desconto de pontos.
- Progressão de nível a cada três acertos consecutivos.
- Ampliação do conjunto de cores conforme o nível.
- Estatísticas de tentativas, acertos, erros e percentual de acerto.
- Feedback visual e sonoro.
- Salvamento de progresso no navegador.
- Opção de reiniciar o progresso.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Interface | React 19, JavaScript e CSS |
| Reconhecimento de voz | Web Speech API |
| Persistência local | localStorage |
| API | Python, FastAPI e Pydantic |
| Banco de dados | MongoDB e Motor |
| Ferramentas do frontend | Yarn e CRACO |

## Uso de IA no desenvolvimento

O Emergent foi utilizado como apoio à elaboração e evolução do código. O projeto documenta minha prática de desenvolvimento assistido por IA.

O nome do repositório faz referência a esse processo. Não há integração com um modelo de linguagem no fluxo atual do jogo.

## Como jogar

1. Informe seu nome.
2. Selecione **Start Game** ou **Training Mode**.
3. Observe a cor apresentada.
4. Clique em **Click to Speak** e pronuncie o nome em inglês.
5. Acompanhe sua pontuação e suas estatísticas.

No modo de jogo, cada acerto acrescenta um ponto e cada erro desconta um ponto, respeitando o mínimo de zero.

## Estrutura

```text
backend/
  server.py
  requirements.txt
frontend/
  public/
  src/
    App.js
    components/
      RickTeacher.js
      RickTeacher.css
    utils/
      colors.js
  package.json
  yarn.lock
```

## Execução local

Os comandos abaixo descrevem a configuração de desenvolvimento; a execução em uma instalação limpa ainda precisa ser validada.

### Frontend

Com Node.js e Yarn Classic disponíveis:

```bash
cd frontend
yarn install --frozen-lockfile
yarn start
```

Abra o endereço informado no terminal.

O jogo utiliza armazenamento local e não depende da API para salvar o progresso atual.

### Backend opcional

Para explorar a API, disponibilize uma instância do MongoDB e crie `backend/.env`:

```dotenv
MONGO_URL=mongodb://localhost:27017
DB_NAME=rick_teacher
CORS_ORIGINS=http://localhost:3000
```

Em um ambiente virtual Python ativado:

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn server:app --reload --port 8000
```

A documentação da API fica em `http://localhost:8000/docs`.

A rota auxiliar `/home` do frontend utiliza
