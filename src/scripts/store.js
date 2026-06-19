export const store = {
  rawVocabulary: null,
  gameDeck: [],
  currentIndex: 0,
  score: 0,
  mode: "A",
  cardCount: 10,
  isAnswered: false,
  timerSeconds: 10,
  cardStartTime: 0,
  totalGameTime: 0,
  resetGame() {
    this.gameDeck = [];
    this.currentIndex = 0;
    this.score = 0;
    this.isAnswered = false;
    this.totalGameTime = 0;
  },
};
