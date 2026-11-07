# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser-based multiple-choice quiz game featuring general knowledge questions. Players answer 4-option trivia questions, receive immediate feedback, and see their score progression. Built entirely with vanilla JavaScript, HTML5, and CSS3 — no external frameworks or libraries.

**Tech Stack**: HTML5 · CSS3 · JavaScript (ES6+)  
**Target**: Modern browsers (Chrome, Firefox, Safari, Edge)  
**Scope**: Educational project — lightweight, responsive, client-side only

## Planned Project Structure

```
Study-03/
├── index.html          # Main page with quiz container and UI
├── style.css           # Styling, responsive design, animations
├── app.js              # Quiz logic, game state, event handlers
├── questions.js        # Quiz questions database (or embed in app.js)
├── CLAUDE.md           # This file
└── assets/             # (optional) Images, icons if needed
    └── (empty for now)
```

## Architecture & Key Components

### HTML (`index.html`)
- Semantic markup with quiz container
- Question display area
- 4 option buttons
- Score/progress display
- Start/restart/next buttons
- Result feedback section

### CSS (`style.css`)
- Responsive grid layout (mobile-first)
- Button states (hover, active, correct/incorrect feedback)
- Color scheme for visual feedback (correct = green, incorrect = red)
- Smooth transitions and animations
- Dark mode support (optional enhancement)

### JavaScript (`app.js`)
**Core Objects/Functions**:
- **`Quiz` class** — Manages state: current question, score, answered questions
  - `load(questions)` — Initialize quiz with question set
  - `nextQuestion()` — Move to next question
  - `checkAnswer(selected)` — Validate answer, update score
  - `isComplete()` — Check if quiz finished
  - `getScore()` — Return final score
- **`UI` class** — Handles DOM updates
  - `renderQuestion(q)` — Display question and options
  - `showFeedback(isCorrect)` — Show correct/incorrect visual feedback
  - `updateScore()` — Update score display
  - `showResults()` — Display final results
- **Event handlers** — Click listeners for option buttons, next/restart buttons

### Questions (`questions.js` or in `app.js`)
**Data format**:
```javascript
const questions = [
  {
    id: 1,
    text: "What is the capital of France?",
    options: ["London", "Paris", "Berlin", "Madrid"],
    correct: 1  // Index of correct answer (0-3)
  },
  // ... more questions
];
```

## Development Workflow

### Starting Out
1. Create HTML structure with quiz container and buttons
2. Add basic CSS for layout and button styling
3. Build Quiz class to manage game state
4. Add event listeners to option buttons
5. Implement immediate feedback (highlight correct/incorrect)
6. Display final score and restart option

### Common Tasks

**Add more questions**:
- Expand the `questions` array in `questions.js`
- Follow the data format: `id`, `text`, `options`, `correct`

**Change styling/colors**:
- Edit `style.css`
- Use CSS custom properties (--color-correct, --color-incorrect) for easy theming

**Add difficulty levels**:
- Extend questions data with `difficulty` field
- Filter questions by selected level in `Quiz.load()`

**Add timer**:
- Add countdown logic in `Quiz.nextQuestion()`
- Update UI display per second
- Auto-submit answer when time expires

**Add question categories**:
- Add `category` field to each question
- Add category filter buttons in UI
- Pre-filter questions before starting

## Key Features to Implement

### Phase 1 (MVP)
- ✅ Display 4-option questions one at a time
- ✅ Track and display score
- ✅ Show correct/incorrect feedback immediately
- ✅ Move to next question after selection
- ✅ Display final score at end
- ✅ Restart quiz button

### Phase 2 (Enhancement)
- [ ] Timer per question (optional)
- [ ] Progress bar (X of Y questions)
- [ ] Category selection before start
- [ ] Difficulty levels
- [ ] Result breakdown (correct by category)
- [ ] Dark mode toggle
- [ ] Mobile-optimized touch experience

## Design Considerations

**User Experience**:
- Provide immediate visual feedback (correct = green highlight, incorrect = red)
- Disable option buttons after selection to prevent changing answer
- Show "Next" button only after answer is selected
- Display progress (e.g., "Question 3 of 10") to motivate completion

**Responsive Design**:
- Buttons must be at least 44px tall for mobile touch targets
- Stack options vertically on small screens, columns on larger screens
- Test on mobile devices (iPhone, Android) before completing

**Performance**:
- Keep questions.js lightweight (can embed in app.js if < 100 questions)
- No external API calls — all data client-side
- Minimal DOM manipulations (update only changed elements)

## Running the Game

```bash
# Option 1: Open directly in browser
# Navigate to Study-03/index.html

# Option 2: Start a local server (for testing)
cd Study-03
python -m http.server 8000
# Then navigate to http://localhost:8000
```

## Code Style & Conventions

- **Variables**: Use `const`/`let` (no `var`)
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **DOM**: Use `querySelector` / `querySelectorAll` for selection
- **Events**: Use `addEventListener()` with named functions (no inline onclick)
- **Comments**: Add only when logic is non-obvious; avoid stating the obvious

## Testing Checklist

Before considering the project complete:
- [ ] All questions display correctly
- [ ] Scoring works accurately (count correct answers)
- [ ] Correct/incorrect feedback shows visually
- [ ] Restart button resets quiz state properly
- [ ] Works on mobile (tested on actual device or emulator)
- [ ] No console errors
- [ ] Smooth animations and transitions
- [ ] Keyboard navigation works (Tab, Enter)

## Resources

- MDN Web Docs: DOM manipulation, Events
- CSS Tricks: Responsive design patterns
- JavaScript.info: ES6+ features reference

퀴즈 문제 교차 검증 가이드라인
모든 문제 작성 시 확인 사항
1. 정답이 하나뿐인가?
- 다른 해석 가능 시 조건 명시 (예: 면적 기준, 2024년 기준)
2. 최상급 표현에 기준이 있는가?
- '가장 큰', '최초의' 등 표현에 측정 기준 명시
3. 시간과 범위가 명확한가?
- 변할 수 있는 정보는 시점 명시
- 지리적, 분류적 범위 한정
4. 교차 검증했는가?
- 의심스러운 정보는 2개 이상 출처 확인
- 논란 있는 내용은 주류 학설 기준