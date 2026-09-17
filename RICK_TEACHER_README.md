# 🎮 Rick Teacher - Learning English

Um jogo interativo de aprendizado de inglês com tema Rick and Morty que usa reconhecimento de voz (SpeechRecognition API) para ensinar cores em inglês.

## 🌟 Funcionalidades

### Sistema de Personalização
- **Nome do Jogador**: Cada jogador pode inserir seu nome ao iniciar
- **Progresso Salvo**: O jogo salva automaticamente no localStorage
- **Persistência**: Pontuação, nível e estatísticas são mantidos ao recarregar a página

### Sistema de Progressão
- **Níveis**: O jogador sobe de nível a cada 3 acertos consecutivos
- **Cores Expansivas**: 
  - **Nível 1**: 10 cores básicas (red, blue, green, yellow, orange, purple, pink, black, white, brown)
  - **Nível 2**: +10 cores secundárias (gray, silver, gold, cyan, magenta, lime, navy, maroon, olive, teal)
  - **Nível 3**: +15 cores exóticas (turquoise, crimson, violet, indigo, beige, salmon, coral, khaki, plum, azure, mint, lavender, peach, ivory, tan)
  - **Nível 4+**: +32 cores avançadas (amber, burgundy, chartreuse, copper, jade, lilac, mahogany, mustard, orchid, pearl, ruby, sapphire, scarlet, tangerine, e muitas mais!)

### Sistema de Pontuação
- **Modo Jogo**: +1 ponto para acertos, -1 ponto para erros
- **Modo Treino**: Apenas pontos positivos, sem penalidades
- **Feedback Visual**: Animações "+1 Rickmoen!" ou "-1 Rickmoen!"
- **Sons**: 
  - Acerto: audio_moeda.mp3
  - Erro: audio_errou.mp3
  - Level Up: Som especial de celebração

### Interatividade e UX
- **Reconhecimento de Voz**: Usa SpeechRecognition API para capturar a fala do usuário
- **Rick Reagindo**: O rosto do Rick muda de expressão (feliz, triste, neutro) conforme o desempenho
- **Mensagens Motivacionais**: Frases icônicas do Rick aparecem aleatoriamente
  - "Wubba lubba dub dub! Keep going, human!"
  - "Not bad for a mortal brain!"
  - "Get schwifty with those colors!"
  - E muito mais!

### Visual e Animações
- **Tema Rick and Morty**: Design inspirado no universo da série
- **Portal de Fundo**: Animação de portal verde pulsante
- **Efeitos de Shimmer**: Brilho deslizante na caixa de cores
- **Animações Fluidas**: Transições suaves e feedback visual imediato
- **Responsive Design**: Funciona perfeitamente em desktop, tablet e mobile

### Estatísticas
- Total de tentativas
- Respostas corretas
- Respostas erradas
- Taxa de acurácia em porcentagem

## 🏗️ Estrutura do Projeto

```
/app/
├── backend/
│   └── server.py           # FastAPI backend com endpoints de progresso
├── frontend/
│   └── src/
│       ├── App.js          # Componente principal com roteamento
│       ├── components/
│       │   ├── RickTeacher.js    # Componente principal do jogo
│       │   └── RickTeacher.css   # Estilos temáticos
│       └── utils/
│           └── colors.js   # Lista completa de cores (67+ cores)
```

## 🎯 Como Jogar

1. **Insira seu nome** na tela inicial
2. Escolha entre **Game Mode** (com penalidades) ou **Training Mode** (sem penalidades)
3. Uma cor será exibida na tela
4. Clique no botão **"Click to Speak"**
5. Fale o nome da cor em inglês
6. Receba feedback imediato e veja o Rick reagir!
7. Acerte 3 vezes seguidas para subir de nível
8. Quanto mais você joga, mais cores são desbloqueadas!

## 🔧 Tecnologias Utilizadas

### Frontend
- **React** (v18+)
- **React Router** (v6+)
- **SpeechRecognition API** (Web Speech API)
- **CSS3** com animações avançadas
- **localStorage** para persistência

### Backend
- **FastAPI** (Python)
- **MongoDB** (banco de dados)
- **Motor** (driver assíncrono do MongoDB)
- **Pydantic** (validação de dados)

## 📊 Endpoints da API

### Progresso do Jogador
- `POST /api/player/progress` - Salvar/atualizar progresso do jogador
- `GET /api/player/progress/{player_name}` - Buscar progresso por nome
- `GET /api/player/leaderboard` - Top 10 jogadores por pontuação

## 🎨 Cores Disponíveis

O jogo inclui mais de **67 cores diferentes** organizadas em 4 níveis de dificuldade:

- **10 cores básicas** (Nível 1)
- **10 cores secundárias** (Nível 2)
- **15 cores exóticas** (Nível 3)
- **32+ cores avançadas** (Nível 4+)

Cada cor tem seu código hexadecimal correspondente para exibição visual precisa.

## 🎭 Características Especiais

### Rick Face Reactions
- **Neutral**: Respiração suave (animação padrão)
- **Happy**: Sorriso animado quando você acerta
- **Sad**: Expressão triste quando você erra

### Mensagens do Rick
O jogo inclui 10 mensagens motivacionais autênticas do Rick:
- "Wubba lubba dub dub! Keep going, human!"
- "Portal fluid couldn't teach you faster!"
- "Get schwifty with those colors!"
- E mais 7 mensagens divertidas!

## 📱 Compatibilidade

- **Navegadores Suportados**: Chrome, Edge, Safari (com Web Speech API)
- **Dispositivos**: Desktop, Tablet, Mobile
- **Idioma de Reconhecimento**: Inglês (en-US)

## 🚀 Melhorias Implementadas

✅ Sistema de personalização com nome do jogador  
✅ Salvamento automático no localStorage  
✅ Progressão de níveis (3 acertos = level up)  
✅ Lista extensa de 67+ cores  
✅ Animações de feedback (+1/-1 Rickmoen!)  
✅ Sons para acerto, erro e level up  
✅ Rick reagindo com expressões diferentes  
✅ Modo Treino sem penalidades  
✅ Mensagens motivacionais do Rick  
✅ Código modular e organizado  
✅ Boas práticas ES6+ (const/let, arrow functions)  
✅ Design responsivo  
✅ Tema Rick and Morty com portais e efeitos  

## 🎓 Aprendizado

Este jogo é perfeito para:
- Praticar pronúncia em inglês
- Aprender vocabulário de cores
- Desenvolver fluência através da repetição
- Se divertir enquanto aprende!

---

**Desenvolvido com** 💚 **inspirado em Rick and Morty**

*"Wubba lubba dub dub!"* - Rick Sanchez
