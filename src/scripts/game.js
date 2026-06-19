import { store } from "./store.js";
import { $, generateOptions, getPrompt, showView, closeMenu } from "./utils.js";
import { CountdownTimer, OPT_COLORS, OPT_BGS } from "./timer.js";
import { loadFromStorage, initDarkMode, toggleDark } from "./storage.js";
import { refreshSetupView, setupReadyInit } from "./setup-ready.js";
import { setupInit, newDeck } from "./setup.js";

let timer = null;

export function renderCard() {
  if (store.currentIndex >= store.gameDeck.length) { endGame(); return; }
  store.isAnswered = false;
  const deck = store.gameDeck;
  const idx = store.currentIndex;
  const current = deck[idx];
  const mode = getCurrentMode();

  const { prompt } = getPrompt(current, mode);
  const options = generateOptions(deck, idx, mode);

  $("card-progress").textContent = `Card ${idx + 1} / ${deck.length}`;
  $("card-prompt").textContent = prompt;

  const container = $("options-container");
  container.innerHTML = "";
  options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.style.setProperty("--opt-color", OPT_COLORS[i % 4]);
    btn.style.setProperty("--opt-bg", OPT_BGS[i % 4]);
    btn.addEventListener("click", () => handleAnswer(btn, opt, current, mode));
    container.appendChild(btn);
  });

  $("card-feedback").className = "feedback";
  $("card-feedback").textContent = "";
  $("next-btn").style.display = "none";
  store.cardStartTime = Date.now();
  startTimer(mode);
}

function getCurrentMode() {
  return store.mode === "C"
    ? (Math.random() < 0.5 ? "A" : "B")
    : store.mode;
}

function startTimer(mode) {
  if (timer) timer.stop();
  const bar = $("timer-bar");
  bar.style.width = "100%";
  bar.style.removeProperty("background");

  timer = new CountdownTimer(
    store.timerSeconds,
    (remaining, total) => {
      const pct = (remaining / total) * 100;
      bar.style.width = `${pct}%`;
    },
    () => {
      if (!store.isAnswered) {
        store.isAnswered = true;
        store.totalGameTime += Date.now() - store.cardStartTime;
        showFeedback(null, store.gameDeck[store.currentIndex], mode);
        showNextBtn();
      }
    }
  );
  timer.start();
}

function handleAnswer(btn, selected, current, mode) {
  if (store.isAnswered) return;
  store.isAnswered = true;
  timer.stop();
  const correct = mode === "A" ? current.word : current.meaning;
  const isCorrect = selected === correct;
  if (isCorrect) store.score++;
  showFeedback(selected, current, mode, isCorrect);
  store.totalGameTime += Date.now() - store.cardStartTime;
  showNextBtn();
}

function showFeedback(selected, current, mode, isCorrect) {
  const correct = mode === "A" ? current.word : current.meaning;
  const feedbackEl = $("card-feedback");
  document.querySelectorAll(".option-btn").forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === correct) {
      btn.classList.add("correct");
    } else if (selected && btn.textContent === selected && !isCorrect) {
      btn.classList.add("incorrect");
    }
  });
  if (isCorrect === undefined) {
    feedbackEl.className = "feedback feedback-timeout";
    feedbackEl.textContent = `Time's up! The answer was: ${correct}`;
  } else if (isCorrect) {
    feedbackEl.className = "feedback feedback-correct";
    feedbackEl.textContent = "Correct!";
  } else {
    feedbackEl.className = "feedback feedback-incorrect";
    feedbackEl.textContent = `The answer was: ${correct}`;
  }
}

function showNextBtn() {
  const isLast = store.currentIndex >= store.gameDeck.length - 1;
  $("next-btn").innerHTML = isLast
    ? "Finalizar"
    : 'Next <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6 3l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  $("next-btn").style.display = "flex";
}

function advanceCard() {
  store.currentIndex++;
  if (store.currentIndex >= store.gameDeck.length) {
    endGame();
  } else {
    renderCard();
  }
}

function endGame() {
  if (timer) timer.stop();
  const total = store.gameDeck.length;
  const pct = total > 0 ? Math.round((store.score / total) * 100) : 0;
  const elapsed = Math.round(store.totalGameTime / 1000);

  const pctEl = $("result-pct");
  if (pct >= 80) {
    pctEl.style.color = "var(--green)";
  } else if (pct >= 50) {
    pctEl.style.color = "var(--orange)";
  } else {
    pctEl.style.color = "var(--red)";
  }

  $("result-score").textContent = `${store.score} / ${total}`;
  pctEl.textContent = `${pct}% Accuracy`;
  $("result-time").textContent = `Time: ${elapsed}s`;
  $("result-correct").textContent = store.score;
  $("result-incorrect").textContent = total - store.score;
  showView("view-results");
}

function goToSetup() {
  if (timer) timer.stop();
  store.resetGame();
  refreshSetupView();
  showView("view-setup");
}

export function init() {
  initDarkMode();

  const saved = loadFromStorage();
  if (saved && Object.keys(saved).length > 0) {
    store.rawVocabulary = saved;
  }
  refreshSetupView();

  document.getElementById("hamburger-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("hamburger").classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!document.getElementById("hamburger").contains(e.target)) {
      closeMenu();
    }
  });

  document.querySelectorAll(".dark-toggle").forEach((btn) => {
    btn.addEventListener("click", toggleDark);
  });

  document.getElementById("menu-load").addEventListener("click", () => {
    closeMenu();
    showView("view-setup");
    document.getElementById("setup-empty").style.display = "block";
    document.getElementById("setup-ready").style.display = "none";
    document.getElementById("upload-error").style.display = "none";
  });

  document.getElementById("play-again-btn").addEventListener("click", goToSetup);
  document.getElementById("new-deck-btn").addEventListener("click", newDeck);
  document.getElementById("configure-btn").addEventListener("click", goToSetup);
  document.getElementById("next-btn").addEventListener("click", advanceCard);

  setupInit();
  setupReadyInit();
  showView("view-setup");
}
