# Kids Games Development Phase Plan - Hub & Games Structure

## Overview
Building a collection of 6 simple games for ages 3-5 with a central hub for game selection and sticker collection. Each game is self-contained in its own folder to avoid system conflicts.

---

## Project Structure

### 🏠 Root Hub Structure
```
kids-games/
├── index.html              # Main hub - game selection
├── hub-styles.css          # Hub-specific styling  
├── shared-styles.css       # Shared animations & styles for all games
├── hub.js                  # Hub logic (sticker display, navigation)
├── color-pop/
│   ├── index.html
│   ├── color-pop.js        # Complete game logic
│   └── assets/
│       ├── audio/
│       └── images/
├── animal-peekaboo/
│   ├── index.html          # (grayed out initially)
│   ├── animal-peekaboo.js
│   └── assets/
├── bug-count/
│   ├── index.html          # (grayed out initially) 
│   ├── bug-count.js
│   └── assets/
├── bird-match/
│   ├── index.html          # (grayed out initially)
│   ├── bird-match.js
│   └── assets/
├── feelings-faces/
│   ├── index.html          # (grayed out initially)
│   ├── feelings-faces.js
│   └── assets/
└── sound-spelling/
    ├── index.html          # (grayed out initially)
    ├── sound-spelling.js
    └── assets/
```

---

## Phase 0: Hub Foundation

### 🏠 Hub Responsibilities (`hub.js`)
- **Game Navigation**: Link to available games, gray out inactive ones
- **Sticker Collection Display**: Show earned stickers with trophy counter
- **Session Tracking**: Simple "games played today" counter
- **Storage Management**: Read/write stickers from localStorage
- **No Game Logic**: Hub only handles navigation and display

### 🎨 Shared Styles (`shared-styles.css`)
- **Animation Classes**: `.pop-animation`, `.bounce`, `.sparkle`, `.celebration`, `.float`
- **Button Styles**: `.game-button`, `.big-touch-target` with 80-100px minimum touch areas
- **Feedback Styles**: `.correct-feedback`, `.try-again-feedback`, `.success-glow`
- **Layout Helpers**: `.center-stage`, `.game-container`, `.mobile-responsive`
- **Color Palettes**: CSS custom properties for consistent theming
- **High Contrast**: Accessibility-friendly color combinations

### 🏠 Hub Styles (`hub-styles.css`)
- **Grid Layout**: Game selection cards in responsive grid
- **Card States**: Active, inactive/grayed out styling
- **Sticker Display**: Trophy area and collection layout
- **Navigation**: Back buttons, transitions between hub and games

---

## Phase 1: Color Pop - First Complete Game

### 🎈 Color Pop Structure (`color-pop/`)
**Complete self-contained game in subfolder**

#### Files:
- **`index.html`**: Game container, loads color-pop.js and shared-styles.css
- **`color-pop.js`**: ALL game behavior (no external dependencies)
- **`assets/`**: Game-specific audio and images

#### Game Responsibilities (All in color-pop.js):
- **Balloon Creation**: Generate balloons with colors, faces, floating animation
- **Game Logic**: Handle color selection, track correct/incorrect choices  
- **Round Management**: 5 rounds per session, progression tracking
- **Audio Playback**: Voice prompts ("Find red!"), sound effects (pop, cheer)
- **Visual Feedback**: Success animations, gentle "try again" responses
- **Score & Completion**: Track progress, trigger end-game celebration
- **Sticker Rewards**: Save sticker to localStorage, return to hub
- **Navigation**: Back to hub button

#### Clean Game Flow:
1. **Load** from hub click → `color-pop/index.html`
2. **Play** 5 rounds of balloon popping
3. **Complete** with celebration and sticker reward
4. **Return** to hub showing new sticker

---

## Phase 2+: Additional Games - Same Pattern

### 🐶 Animal Peekaboo (`animal-peekaboo/`)
- **Self-contained**: Complete game in subfolder
- **Own logic**: `animal-peekaboo.js` handles everything
- **Reuses**: `shared-styles.css` for animations and buttons
- **Returns**: To hub with sticker reward

### 🐛 Bug Count (`bug-count/`)
- **Self-contained**: Complete game in subfolder  
- **Own logic**: `bug-count.js` handles counting and targets
- **Reuses**: `shared-styles.css` for touch targets and feedback
- **Returns**: To hub with sticker reward

### 🐦 Bird Match (`bird-match/`)
- **Self-contained**: Complete game in subfolder
- **Own logic**: `bird-match.js` handles drag & drop matching
- **Reuses**: `shared-styles.css` for success animations
- **Returns**: To hub with sticker reward

### 😊 Feelings Faces (`feelings-faces/`)
- **Self-contained**: Complete game in subfolder
- **Own logic**: `feelings-faces.js` handles emotion recognition
- **Reuses**: `shared-styles.css` for button styles
- **Returns**: To hub with sticker reward

### 🔤 Sound Spelling (`sound-spelling/`)
- **Self-contained**: Complete game in subfolder
- **Own logic**: `sound-spelling.js` handles letters and phonics
- **Reuses**: `shared-styles.css` for interactive elements
- **Returns**: To hub with sticker reward

---

## Code Organization Strategy

### ✅ What We Share
- **CSS Styles**: Animations, layouts, color themes via `shared-styles.css`
- **Sticker System**: Shared localStorage format for earned stickers
- **Design Language**: Consistent look, feel, interactions across all games
- **File Structure**: Same pattern for each game subfolder

### ❌ What We Don't Share  
- **JavaScript Logic**: Each game completely self-contained
- **Event Listeners**: No shared event management
- **Game State**: Each game manages own state independently
- **Audio Management**: Each game handles own sounds

### 🔄 Development Process
1. **Build hub navigation** and sticker display system
2. **Complete Color Pop** as first full game  
3. **Test hub ↔ game flow** and sticker rewards
4. **Copy successful patterns** to build additional games
5. **Each game developed independently** in own subfolder

---

## Navigation Flow

### Hub → Game:
```
Hub (index.html) 
  ↓ click Color Pop
Color Pop (color-pop/index.html)
  ↓ complete game + earn sticker  
Hub (index.html) - updated sticker count
```

### Game → Hub:
- **Back button** in each game returns to hub
- **Game completion** saves sticker and redirects to hub
- **Hub reads** updated sticker collection from localStorage

---

## Technical Considerations

### Performance Targets
- 60fps on mobile devices
- <2 second load time per game
- <5MB total asset size per game

### Browser Support
- Modern mobile browsers (iOS Safari, Chrome Android)  
- Touch-first interaction model
- Progressive enhancement for haptics

### Development Workflow
- Well-commented functions (no more than 3 layers deep)
- Clear comment blocks for easy code manipulation  
- Backup reminders every 2 hours during coding
- Stop after each code addition for approval
- Each game folder can be worked on independently

---

## Success Metrics for Phase 1
- [ ] Hub navigation works smoothly between games
- [ ] Color Pop runs as complete, self-contained game
- [ ] Sticker reward system works (game → hub → sticker display)
- [ ] No competing event listeners or audio conflicts
- [ ] Clean subfolder structure ready for additional games
- [ ] Session length stays within 60-180 seconds per game
- [ ] Easy to understand and modify code in each game

---

*Next Step: Build hub structure, then complete Color Pop game*
