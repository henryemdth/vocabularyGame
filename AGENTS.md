# Project Specification: English Vocabulary Practice Web App

## 1. Overview
An interactive, serverless web application designed to help users practice English vocabulary using flashcards with multiple-choice options. The application runs entirely on the frontend, using a local JSON file uploaded by the user as the data source.

## 2. Core Features & User Flow

### 2.A Data Ingestion
* The user uploads a local `.json` file containing vocabulary pairs.
* **JSON Format expected:** A flat key-value object where keys and values are strings.
    ```json
    {
      "apple": "manzana",
      "book": "libro",
      " Taylor-made": "hecho a la medida"
    }
    ```
* The app must parse and validate this JSON in the browser, storing it in memory/state.

### 2.B Game Configuration (Setup Screen)
Before starting a game, the user must configure the session via a simple UI:
1.  **Game Mode Selection:**
    * *Mode A:* Show Meaning $\rightarrow$ Guess Word (Displays the translation, options are English words).
    * *Mode B:* Show Word $\rightarrow$ Guess Meaning (Displays the English word, options are translations).
    * *Mode C (Optional/Ideal):* Mixed (Randomly alternates between Mode A and Mode B per card).
2.  **Difficulty / Deck Size Selector:**
    * A slider or input to select the percentage of the JSON deck to play (e.g., 25%, 50%, 75%, 100%).
    * The app must randomly sample $X\%$ of the total keys from the uploaded JSON based on this selection.

### 2.C Gameplay Loop (The Game Screen)
* **Card Presentation:** A main card component displaying the target prompt (either the word or the meaning, depending on the mode).
* **Multiple-Choice Options:**
    * Four (4) selectable buttons/cards.
    * One (1) correct answer.
    * Three (3) incorrect distractors randomly sampled from the *rest* of the uploaded JSON deck.
    * *Note:* Ensure options are always shuffled so the correct answer isn't in a fixed position.
* **Timer System:**
    * A visual countdown timer per card (e.g., 10 or 15 seconds) or a global running timer for the whole session.
    * If the timer hits 0, it counts as an incorrect answer and automatically transitions to the next card after a brief delay.
* **Feedback Mechanism:**
    * When an option is clicked:
        * Highlight the correct option in green.
        * If the user chose wrong, highlight their selection in red.
    * Freeze inputs during feedback to avoid double-clicking.
    * Automatically advance to the next card after a 1.5-second delay.

### 2.D Results Screen
* Displayed once all cards in the selected percentage sub-deck have been answered.
* Shows summary metrics: Score (Correct/Total), Percentage of Accuracy, and Total Time taken.
* Option to "Play Again" with the same deck (re-shuffling) or "Upload New Deck".

---

## 3. Technical Requirements & Architecture
* **No Backend:** All state management, JSON parsing, shuffling logic, and timers must run strictly on the client side.
* **Persistence (Optional but Recommended):** Save the uploaded JSON elements in `localStorage` or `IndexedDB` so the user doesn't have to re-upload the file on every page refresh.
* **State Architecture:**
    * `rawVocabulary`: Original parsed JSON map.
    * `gameDeck`: Shuffled array of items filtered by the chosen percentage.
    * `currentIndex`: Tracks the current question.
    * `score`: Number of correct answers.

---

## 4. Step-by-Step Implementation Plan

### Step 1: Initial Setup & UI Skeleton
- [ ] Initialize project with selected frontend stack.
- [ ] Set up layout structure (Header, Main Container, Footer).
- [ ] Create basic routing or conditional rendering for 3 views: `Welcome/Upload`, `Game`, `Results`.

### Step 2: File Upload & Validation
- [ ] Build the file input component handling `.json` files.
- [ ] Implement parsing logic with `FileReader`.
- [ ] Add basic error handling (alert user if JSON is malformed or doesn't match `Record<string, string>`).

### Step 3: Game Logic & Math Utils
- [ ] Create a utility function to shuffle arrays (Fisher-Yates algorithm).
- [ ] Create a function to pick $X\%$ random items from the dataset.
- [ ] Create a distractor-generation function that extracts 3 random incorrect answers ensuring no duplicates with the correct one.

### Step 4: Core Gameplay Components
- [ ] Build the Flashcard UI.
- [ ] Implement the multiple-choice button grid.
- [ ] Build the Timer hook/component (`setInterval` driven).
- [ ] Implement click handlers for answers, state updates (+1 score, index transition), and visual feedback classes.

### Step 5: Results & Polish
- [ ] Build the final score breakdown screen.
- [ ] Add transitions/animations for card swapping (e.g., fade-in/out).
- [ ] Ensure mobile responsiveness (cards must scale nicely on smartphones).