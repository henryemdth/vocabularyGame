export const $ = (id) => document.getElementById(id);

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sampleRandom(vocab, count) {
  const entries = Object.entries(vocab);
  const n = Math.min(count, entries.length);
  return shuffle(entries).slice(0, n).map(([word, meaning]) => ({
    word: word.trim(),
    meaning: meaning.trim(),
  }));
}

export function generateOptions(deck, currentIndex, mode) {
  const current = deck[currentIndex];
  const correct = mode === "A" ? current.word : current.meaning;
  const pool = deck.filter((_, i) => i !== currentIndex);
  const distractors = shuffle(pool).slice(0, 3).map(
    (item) => (mode === "A" ? item.word : item.meaning)
  );
  return shuffle([correct, ...distractors]);
}

export function getPrompt(current, mode) {
  return mode === "A"
    ? { prompt: current.meaning, answerKey: "word" }
    : { prompt: current.word, answerKey: "meaning" };
}

export function showView(id) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  $(id).classList.add("active");
}

export function closeMenu() {
  document.getElementById("hamburger").classList.remove("open");
}

export function validateVocabulary(data) {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("JSON must be a flat object { key: value }");
  }
  const keys = Object.keys(data);
  if (keys.length === 0) throw new Error("JSON object is empty");
  for (const [key, val] of Object.entries(data)) {
    if (typeof key !== "string" || typeof val !== "string") {
      throw new Error(`All values must be strings. Invalid entry: "${key}"`);
    }
  }
}
