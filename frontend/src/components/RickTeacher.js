import React, { useState, useEffect, useRef } from 'react';
import './RickTeacher.css';
import { getRandomColorForLevel, checkColorMatch, getTotalColorsForLevel } from '../utils/colors';

// URLs dos arquivos de áudio
const SOUND_CORRECT = 'https://customer-assets.emergentagent.com/job_630adc71-b07b-48bc-aa5d-ff0216ed1676/artifacts/k7m44jkc_Aprenda-Ingles_audio_audio_moeda.mp3';
const SOUND_WRONG = 'https://customer-assets.emergentagent.com/job_630adc71-b07b-48bc-aa5d-ff0216ed1676/artifacts/mrenu2vv_Aprenda-Ingles_audio_audio_errou.mp3';

// Mensagens motivacionais do Rick
const RICK_MESSAGES = [
  "Wubba lubba dub dub! Keep going, human!",
  "Not bad for a mortal brain!",
  "Science! You're learning!",
  "Portal fluid couldn't teach you faster!",
  "Your neural pathways are expanding!",
  "Impressive for someone without my IQ!",
  "Get schwifty with those colors!",
  "Even Jerry could... wait, no he couldn't!",
  "That's the way the news goes!",
  "Lick lick lick my balls! ...I mean, good job!"
];

const RickTeacher = () => {
  // Estados do jogo
  const [gameState, setGameState] = useState('setup'); // setup, playing, training
  const [playerName, setPlayerName] = useState('');
  const [currentColor, setCurrentColor] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'correct'|'wrong', text: string }
  const [rickMood, setRickMood] = useState('neutral'); // neutral, happy, sad
  const [rickMessage, setRickMessage] = useState('');
  const [stats, setStats] = useState({ totalAttempts: 0, correctAnswers: 0, wrongAnswers: 0 });
  
  // Refs para áudio e reconhecimento de voz
  const recognitionRef = useRef(null);
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const levelUpSoundRef = useRef(null);

  // Inicializar áudios
  useEffect(() => {
    correctSoundRef.current = new Audio(SOUND_CORRECT);
    wrongSoundRef.current = new Audio(SOUND_WRONG);
    // Placeholder para level up - pode ser substituído por um áudio real
    levelUpSoundRef.current = new Audio(SOUND_CORRECT);
  }, []);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('rickTeacherData');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.playerName) {
        setPlayerName(data.playerName);
        setScore(data.score || 0);
        setLevel(data.level || 1);
        setConsecutiveCorrect(data.consecutiveCorrect || 0);
        setStats(data.stats || { totalAttempts: 0, correctAnswers: 0, wrongAnswers: 0 });
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que mudarem
  useEffect(() => {
    if (playerName) {
      const dataToSave = {
        playerName,
        score,
        level,
        consecutiveCorrect,
        stats,
        lastPlayed: new Date().toISOString()
      };
      localStorage.setItem('rickTeacherData', JSON.stringify(dataToSave));
    }
  }, [playerName, score, level, consecutiveCorrect, stats]);

  // Inicializar reconhecimento de voz
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Seu navegador não suporta reconhecimento de voz. Tente usar Chrome ou Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      handleVoiceInput(spokenText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        showFeedback('wrong', 'No speech detected. Try again!');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [currentColor, gameState]);

  // Iniciar jogo
  const startGame = (mode = 'playing') => {
    if (!playerName.trim()) {
      alert('Por favor, insira seu nome!');
      return;
    }
    setGameState(mode);
    setCurrentColor(getRandomColorForLevel(level));
    setRickMessage(RICK_MESSAGES[Math.floor(Math.random() * RICK_MESSAGES.length)]);
  };

  // Gerar nova cor
  const generateNewColor = () => {
    setCurrentColor(getRandomColorForLevel(level));
    setFeedback(null);
    setRickMood('neutral');
  };

  // Processar entrada de voz
  const handleVoiceInput = (spokenText) => {
    if (!currentColor) return;

    const isCorrect = checkColorMatch(spokenText, currentColor.name);
    const newStats = { ...stats, totalAttempts: stats.totalAttempts + 1 };

    if (isCorrect) {
      handleCorrectAnswer(newStats);
    } else {
      handleWrongAnswer(newStats, spokenText);
    }
  };

  // Lidar com resposta correta
  const handleCorrectAnswer = (newStats) => {
    const newScore = score + 1;
    const newConsecutive = consecutiveCorrect + 1;
    newStats.correctAnswers += 1;

    setScore(newScore);
    setConsecutiveCorrect(newConsecutive);
    setStats(newStats);
    setRickMood('happy');
    showFeedback('correct', '+1 Rickmoen!');
    correctSoundRef.current.play();

    // Verificar se deve subir de nível (3 acertos consecutivos)
    if (newConsecutive >= 3) {
      levelUp();
    } else {
      setTimeout(generateNewColor, 1500);
    }
  };

  // Lidar com resposta errada
  const handleWrongAnswer = (newStats, spokenText) => {
    if (gameState === 'playing') {
      const newScore = Math.max(0, score - 1);
      setScore(newScore);
    }
    
    newStats.wrongAnswers += 1;
    setConsecutiveCorrect(0);
    setStats(newStats);
    setRickMood('sad');
    showFeedback('wrong', `-1 Rickmoen! You said "${spokenText}"`);
    wrongSoundRef.current.play();

    setTimeout(generateNewColor, 2000);
  };

  // Subir de nível
  const levelUp = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    setConsecutiveCorrect(0);
    setRickMood('happy');
    showFeedback('levelup', `🎉 LEVEL UP! Welcome to Level ${newLevel}!`);
    levelUpSoundRef.current.play();
    
    const newMessage = RICK_MESSAGES[Math.floor(Math.random() * RICK_MESSAGES.length)];
    setRickMessage(newMessage);

    setTimeout(generateNewColor, 3000);
  };

  // Mostrar feedback visual
  const showFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 2000);
  };

  // Iniciar escuta
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  // Resetar progresso
  const resetProgress = () => {
    if (window.confirm('Tem certeza que deseja resetar todo o seu progresso?')) {
      localStorage.removeItem('rickTeacherData');
      setScore(0);
      setLevel(1);
      setConsecutiveCorrect(0);
      setStats({ totalAttempts: 0, correctAnswers: 0, wrongAnswers: 0 });
      setGameState('setup');
      setCurrentColor(null);
    }
  };

  // Voltar ao menu
  const backToMenu = () => {
    setGameState('setup');
    setCurrentColor(null);
    setFeedback(null);
    setRickMood('neutral');
  };

  // Renderizar tela de setup
  if (gameState === 'setup') {
    return (
      <div className="rick-teacher-container">
        <div className="portal-background"></div>
        <div className="setup-screen">
          <div className="rick-logo">
            <div className="rick-face neutral"></div>
          </div>
          <h1 className="game-title">Rick Teacher</h1>
          <h2 className="game-subtitle">Learning English with Colors</h2>
          
          <div className="player-setup">
            <label htmlFor="playerName">What's your name, mortal?</label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              className="player-input"
              data-testid="player-name-input"
            />
            
            <div className="button-group">
              <button 
                onClick={() => startGame('playing')} 
                className="start-button"
                data-testid="start-game-button"
              >
                Start Game
              </button>
              <button 
                onClick={() => startGame('training')} 
                className="training-button"
                data-testid="training-mode-button"
              >
                Training Mode
              </button>
            </div>

            {playerName && score > 0 && (
              <div className="saved-progress">
                <p>Welcome back, {playerName}!</p>
                <p>Score: {score} | Level: {level}</p>
                <button onClick={resetProgress} className="reset-button">
                  Reset Progress
                </button>
              </div>
            )}
          </div>

          <div className="instructions">
            <h3>How to Play:</h3>
            <ul>
              <li>🎤 Click "Listen" and say the color in English</li>
              <li>✅ Correct answer: +1 point</li>
              <li>❌ Wrong answer: -1 point (no penalty in Training Mode)</li>
              <li>🎯 3 correct answers in a row: Level Up!</li>
              <li>📈 Higher levels = More colors to learn!</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar tela de jogo
  return (
    <div className="rick-teacher-container">
      <div className="portal-background"></div>
      
      {/* Cabeçalho com informações */}
      <div className="game-header">
        <div className="player-info" data-testid="player-info">
          <span className="player-name">👤 {playerName}</span>
          <span className="player-score" data-testid="current-score">⭐ Score: {score}</span>
          <span className="player-level" data-testid="current-level">🎯 Level: {level}</span>
          <span className="consecutive-info">🔥 Streak: {consecutiveCorrect}/3</span>
        </div>
        <div className="game-mode-badge">
          {gameState === 'training' ? '🎓 Training Mode' : '🎮 Game Mode'}
        </div>
      </div>

      {/* Rick reagindo */}
      <div className="rick-section">
        <div className={`rick-face ${rickMood}`} data-testid="rick-face"></div>
        {rickMessage && (
          <div className="rick-speech-bubble">
            <p>{rickMessage}</p>
          </div>
        )}
      </div>

      {/* Display da cor atual */}
      {currentColor && (
        <div className="color-display-section">
          <h2 className="instruction-text">What color is this?</h2>
          <div 
            className="color-box" 
            style={{ backgroundColor: currentColor.hex }}
            data-testid="color-display"
          >
            <div className="color-shimmer"></div>
          </div>
          <p className="color-info">
            Total colors at this level: {getTotalColorsForLevel(level)}
          </p>
        </div>
      )}

      {/* Botão de escuta */}
      <div className="controls">
        <button
          onClick={startListening}
          disabled={isListening}
          className={`listen-button ${isListening ? 'listening' : ''}`}
          data-testid="listen-button"
        >
          {isListening ? (
            <>
              <span className="pulse-ring"></span>
              🎤 Listening...
            </>
          ) : (
            '🎤 Click to Speak'
          )}
        </button>
      </div>

      {/* Feedback animado */}
      {feedback && (
        <div className={`feedback-animation ${feedback.type}`} data-testid="feedback-message">
          {feedback.text}
        </div>
      )}

      {/* Estatísticas */}
      <div className="stats-panel" data-testid="stats-panel">
        <h3>Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total Attempts:</span>
            <span className="stat-value">{stats.totalAttempts}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Correct:</span>
            <span className="stat-value correct">{stats.correctAnswers}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Wrong:</span>
            <span className="stat-value wrong">{stats.wrongAnswers}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Accuracy:</span>
            <span className="stat-value">
              {stats.totalAttempts > 0 
                ? Math.round((stats.correctAnswers / stats.totalAttempts) * 100) 
                : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Botões de navegação */}
      <div className="navigation-buttons">
        <button onClick={backToMenu} className="back-button">
          ← Back to Menu
        </button>
        <button onClick={resetProgress} className="reset-button">
          🔄 Reset Progress
        </button>
      </div>
    </div>
  );
};

export default RickTeacher;
