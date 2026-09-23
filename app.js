const CURRICULUM = window.RICK_CURRICULUM || [];
const API_BASE = "http://127.0.0.1:8000/api";
const STORAGE_KEY = "rick-teacher-ai-local-progress-v3";

const GOAL_LABELS = {
  general: "Construir uma base geral",
  conversation: "Conversação básica",
  travel: "Viagens",
  work: "Trabalho e estudos",
};

const QUICK_PROMPTS = [
  "Teach me how to introduce myself.",
  "Correct this: I have 30 years old.",
  "Let's practice a simple café conversation.",
  "Give me a 3-question A1 mini quiz.",
];

const DEFAULT_PROGRESS = {
  profile: null,
  completedLessons: [],
  xp: 0,
  totalAnswers: 0,
  correctAnswers: 0,
  activeLessonId: null,
};

let progress = loadProgress();
let currentView = "learn";
let activeLesson = null;
let quizIndex = 0;
let lessonCorrect = 0;
let selectedAnswer = null;
let messages = [
  {
    role: "assistant",
    content: "Hi! I'm Rick Teacher AI. Posso explicar em português e praticar inglês com você. What would you like to practice today?",
  },
];
let aiModel = "";
let aiReady = false;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return saved ? { ...DEFAULT_PROGRESS, ...saved } : { ...DEFAULT_PROGRESS };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;",
  }[char]));
}

function showToast(text) {
  const toast = $("#toast");
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function completionPercent() {
  return CURRICULUM.length ? Math.round((progress.completedLessons.length / CURRICULUM.length) * 100) : 0;
}

function accuracyPercent() {
  return progress.totalAnswers ? Math.round((progress.correctAnswers / progress.totalAnswers) * 100) : 0;
}

function nextLesson() {
  return CURRICULUM.find((lesson) => !progress.completedLessons.includes(lesson.id)) || CURRICULUM[CURRICULUM.length - 1];
}

function setView(view) {
  currentView = view;
  ["learn", "lesson", "tutor", "progress"].forEach((name) => {
    const section = $("#" + name + "View");
    if (section) section.classList.toggle("hidden", name !== view);
  });
  $$(".nav-button").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  if (view === "tutor") renderTutorContext();
  if (view === "progress") renderProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderShell() {
  const hasProfile = Boolean(progress.profile);
  $("#onboarding").classList.toggle("hidden", hasProfile);
  $("#learnView").classList.toggle("hidden", !hasProfile || currentView !== "learn");
  $(".topbar").classList.toggle("muted", !hasProfile);
  if (!hasProfile) return;

  $("#heroGreeting").textContent = `Olá, ${progress.profile.name}. Ready to learn?`;
  $("#heroProgress").textContent = `${completionPercent()}%`;
  $("#heroXp").textContent = progress.xp;
  $("#heroAccuracy").textContent = `${accuracyPercent()}%`;
  $("#lessonCounter").textContent = `${progress.completedLessons.length}/${CURRICULUM.length} concluídas`;
  renderLessons();
  renderProgress();
  renderTutorContext();
}

function renderLessons() {
  const grid = $("#lessonGrid");
  grid.innerHTML = CURRICULUM.map((lesson) => {
    const done = progress.completedLessons.includes(lesson.id);
    const next = nextLesson()?.id === lesson.id && !done;
    return `
      <article class="lesson-card ${done ? "done" : ""} ${next ? "next" : ""}">
        <div class="lesson-topline"><span>${lesson.number}</span><span class="lesson-icon">${lesson.icon}</span></div>
        <span class="lesson-level">${lesson.level}${done ? " • concluída" : next ? " • próxima" : ""}</span>
        <h3>${escapeHtml(lesson.title)}</h3>
        <p class="lesson-subtitle">${escapeHtml(lesson.subtitle)}</p>
        <p>${escapeHtml(lesson.summary)}</p>
        <button class="card-button" data-lesson-id="${lesson.id}">${done ? "Revisar" : "Abrir lição"} →</button>
      </article>`;
  }).join("");
}

function openLesson(id) {
  activeLesson = CURRICULUM.find((lesson) => lesson.id === id);
  if (!activeLesson) return;
  progress.activeLessonId = id;
  saveProgress();
  quizIndex = 0;
  lessonCorrect = 0;
  selectedAnswer = null;
  renderLesson();
  setView("lesson");
}

function renderLesson() {
  if (!activeLesson) return;
  const content = $("#lessonContent");
  content.innerHTML = `
    <section class="lesson-hero">
      <span class="lesson-big-icon">${activeLesson.icon}</span>
      <div><span class="eyebrow">UNIDADE ${activeLesson.number} • ${activeLesson.level}</span><h1>${escapeHtml(activeLesson.title)}</h1><p>${escapeHtml(activeLesson.summary)}</p></div>
    </section>
    <div class="lesson-columns">
      <section class="lesson-panel"><span class="eyebrow">VOCABULÁRIO</span><h2>Palavras essenciais</h2><div class="vocab-list">${activeLesson.vocabulary.map(([en, pt]) => `<button class="vocab-item" data-speak="${escapeHtml(en)}"><span><strong>${escapeHtml(en)}</strong><small>${escapeHtml(pt)}</small></span><span>🔊</span></button>`).join("")}</div></section>
      <section class="lesson-panel"><span class="eyebrow">ESTRUTURA</span><h2>Entenda a lógica</h2><p class="grammar-note">${escapeHtml(activeLesson.grammar)}</p><h3>Exemplos</h3><div class="example-list">${activeLesson.examples.map((example) => `<button data-speak="${escapeHtml(example)}">${escapeHtml(example)} <span>🔊</span></button>`).join("")}</div></section>
    </div>
    <section class="quiz-panel"><div class="quiz-heading"><div><span class="eyebrow">MINI QUIZ</span><h2>Teste rápido</h2></div><span id="quizProgress">1/${activeLesson.quiz.length}</span></div><div id="quizBody"></div></section>
    <section class="lesson-ai-strip"><div><span class="eyebrow">QUER IR ALÉM?</span><h2>Pratique esta unidade com o tutor.</h2><p>O contexto da lição será enviado junto com sua pergunta.</p></div><button class="secondary-button" data-practice-active>Praticar com a IA →</button></section>`;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const question = activeLesson.quiz[quizIndex];
  $("#quizProgress").textContent = `${quizIndex + 1}/${activeLesson.quiz.length}`;
  $("#quizBody").innerHTML = `
    <h3>${escapeHtml(question.q)}</h3>
    <div class="quiz-options">${question.options.map((option, index) => `<button class="quiz-option" data-answer="${index}">${escapeHtml(option)}</button>`).join("")}</div>
    <div id="quizFeedback" class="quiz-feedback hidden"></div>`;
  selectedAnswer = null;
}

function answerQuestion(index) {
  if (selectedAnswer !== null) return;
  selectedAnswer = index;
  const question = activeLesson.quiz[quizIndex];
  const correct = index === question.answer;
  if (correct) lessonCorrect += 1;

  $$(".quiz-option").forEach((button, optionIndex) => {
    button.disabled = true;
    if (optionIndex === question.answer) button.classList.add("correct");
    if (optionIndex === index && !correct) button.classList.add("wrong");
  });

  const feedback = $("#quizFeedback");
  feedback.classList.remove("hidden");
  feedback.innerHTML = `<strong>${correct ? "✓ Certo!" : "Quase."}</strong><p>${escapeHtml(question.explanation)}</p><button id="nextQuestion" class="primary-button">${quizIndex === activeLesson.quiz.length - 1 ? "Concluir lição" : "Próxima pergunta"}</button>`;
}

function nextQuizStep() {
  if (selectedAnswer === null) return;
  if (quizIndex < activeLesson.quiz.length - 1) {
    quizIndex += 1;
    renderQuizQuestion();
    return;
  }

  const alreadyDone = progress.completedLessons.includes(activeLesson.id);
  if (!alreadyDone) {
    progress.completedLessons.push(activeLesson.id);
    progress.xp += 25;
  }
  progress.totalAnswers += activeLesson.quiz.length;
  progress.correctAnswers += lessonCorrect;
  saveProgress();

  $("#quizBody").innerHTML = `<div class="quiz-finish"><span>🏁</span><h3>Lição concluída</h3><p>Você acertou ${lessonCorrect} de ${activeLesson.quiz.length}. ${alreadyDone ? "Revisão registrada sem XP extra." : "+25 XP adicionados."}</p><button id="finishLesson" class="primary-button">Voltar para a trilha</button></div>`;
  renderShell();
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    showToast("Síntese de voz não disponível neste navegador.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.88;
  window.speechSynthesis.speak(utterance);
}

function renderTutorContext() {
  if (!progress.profile) return;
  const lesson = activeLesson || CURRICULUM.find((item) => item.id === progress.activeLessonId) || nextLesson();
  $("#tutorContext").innerHTML = `<span>Nível</span><strong>A1 — Beginner</strong><span>Objetivo</span><strong>${escapeHtml(GOAL_LABELS[progress.profile.goal] || GOAL_LABELS.general)}</strong><span>Contexto</span><strong>${escapeHtml(lesson?.title || "A1 foundations")}</strong>`;
  $("#quickPrompts").innerHTML = QUICK_PROMPTS.map((prompt) => `<button data-quick-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join("");
}

function renderMessages() {
  const log = $("#chatLog");
  log.innerHTML = messages.map((message) => `<div class="chat-message ${message.role} ${message.error ? "error" : ""}"><span>${message.role === "assistant" ? "R" : "Você"}</span><p>${escapeHtml(message.content)}</p></div>`).join("");
  log.scrollTop = log.scrollHeight;
}

async function checkAi() {
  try {
    const response = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("offline");
    const data = await response.json();
    aiReady = Boolean(data.ai_configured);
    aiModel = data.model || "";
    $("#aiDot").className = `status-dot ${aiReady ? "ready" : "warning"}`;
    $("#aiStatus").textContent = aiReady ? "Tutor IA conectado" : "API ativa • chave ausente";
    $("#chatModel").textContent = aiReady ? `Modelo: ${aiModel}` : "Backend ativo • configure a chave";
  } catch {
    aiReady = false;
    $("#aiDot").className = "status-dot offline";
    $("#aiStatus").textContent = "Tutor IA offline";
    $("#chatModel").textContent = "Backend local não iniciado";
  }
}

async function sendTutorMessage(text) {
  const clean = String(text || $("#chatInput").value).trim();
  if (!clean) return;
  if (!progress.profile) return;

  const history = messages.slice(-10).map(({ role, content }) => ({ role, content }));
  messages.push({ role: "user", content: clean });
  $("#chatInput").value = "";
  renderMessages();

  const loading = { role: "assistant", content: "Thinking..." };
  messages.push(loading);
  renderMessages();

  const lesson = activeLesson || CURRICULUM.find((item) => item.id === progress.activeLessonId) || nextLesson();

  try {
    const response = await fetch(`${API_BASE}/tutor/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: clean,
        student_name: progress.profile.name,
        level: "A1 - Beginner",
        goal: GOAL_LABELS[progress.profile.goal] || GOAL_LABELS.general,
        lesson_context: lesson?.title || "A1 foundations",
        history,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Não foi possível acessar o tutor.");
    loading.content = data.reply;
    aiModel = data.model || aiModel;
    aiReady = true;
    $("#chatModel").textContent = `Modelo: ${aiModel}`;
  } catch (error) {
    loading.content = error.message || "Tutor indisponível. Inicie o backend local e confira sua chave de API.";
    loading.error = true;
  }
  renderMessages();
}

function startVoiceInput() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    showToast("Ditado por voz não está disponível neste navegador. Digite normalmente.");
    return;
  }
  const recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  $("#voiceButton").classList.add("listening");
  recognition.onend = () => $("#voiceButton").classList.remove("listening");
  recognition.onerror = () => $("#voiceButton").classList.remove("listening");
  recognition.onresult = (event) => { $("#chatInput").value = event.results[0][0].transcript; };
  recognition.start();
}

function renderProgress() {
  $("#progressCompletion").textContent = `${completionPercent()}%`;
  $("#progressXp").textContent = `${progress.xp} XP`;
  $("#progressAccuracy").textContent = `${accuracyPercent()}%`;
  $("#progressProfile").textContent = progress.profile ? `${progress.profile.name} • A1 Beginner • objetivo: ${GOAL_LABELS[progress.profile.goal] || GOAL_LABELS.general}` : "Nenhum perfil configurado.";
}

function wireEvents() {
  $("#onboardingForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    progress.profile = { name: form.get("studentName").trim(), goal: form.get("studentGoal") };
    saveProgress();
    renderShell();
    setView("learn");
    showToast("Trilha criada. Welcome!");
  });

  $$(".nav-button").forEach((button) => button.addEventListener("click", () => {
    if (!progress.profile) return;
    setView(button.dataset.view);
  }));

  $("#continueButton").addEventListener("click", () => openLesson(nextLesson().id));
  $("#backToLearn").addEventListener("click", () => setView("learn"));
  $$('[data-go-tutor]').forEach((button) => button.addEventListener("click", () => setView("tutor")));

  document.addEventListener("click", (event) => {
    const lessonButton = event.target.closest("[data-lesson-id]");
    if (lessonButton) openLesson(lessonButton.dataset.lessonId);

    const speakButton = event.target.closest("[data-speak]");
    if (speakButton) speak(speakButton.dataset.speak);

    const answer = event.target.closest("[data-answer]");
    if (answer) answerQuestion(Number(answer.dataset.answer));

    if (event.target.closest("#nextQuestion")) nextQuizStep();
    if (event.target.closest("#finishLesson")) setView("learn");

    const practice = event.target.closest("[data-practice-active]");
    if (practice) {
      setView("tutor");
      $("#chatInput").value = `Let's practice ${activeLesson?.title || "basic English"} at A1 level.`;
      $("#chatInput").focus();
    }

    const quick = event.target.closest("[data-quick-prompt]");
    if (quick) sendTutorMessage(quick.dataset.quickPrompt);
  });

  $("#chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    sendTutorMessage();
  });
  $("#voiceButton").addEventListener("click", startVoiceInput);

  $("#resetProgress").addEventListener("click", () => {
    if (!confirm("Apagar todo o progresso local e voltar ao início?")) return;
    localStorage.removeItem(STORAGE_KEY);
    progress = { ...DEFAULT_PROGRESS };
    activeLesson = null;
    currentView = "learn";
    renderShell();
    $("#onboarding").classList.remove("hidden");
  });
}

renderMessages();
wireEvents();
renderShell();
checkAi();
