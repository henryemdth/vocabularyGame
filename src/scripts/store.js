export const store = {
  rawVocabulary: null,
  gameDeck: [],
  currentIndex: 0,
  score: 0,
  mode: "A",
  cardCount: 10,
  isAnswered: false,
  resetGame() {
    this.gameDeck = [];
    this.currentIndex = 0;
    this.score = 0;
    this.isAnswered = false;
  },
};
