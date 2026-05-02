# AIgal — An AI-Powered Visual Novel Game

> [中文版](README.md)

> 🎮 Welcome to AIgal! This is a modern Galgame (visual novel) driven in real-time by Large Language Models (LLMs). 
> Traditional visual novels, while featuring excellent plots, often suffer from having only a few fixed dialogue branches. Players are forced to passively answer "multiple-choice questions," which loses its charm once you clear the game.
> However, in AIgal, **there are no predetermined scripts and no rigid options!** You can type anything you want to say or do using natural language. The AI will dynamically generate the plot, character reactions, and even automatically switch backgrounds and character sprites based on your actions. Every choice you make leads to a unique, infinitely branching immersive adventure.

## preview
![preview](preview.png)

---

## 🚀 Quick Start

### Environment Requirements

| Dependency | Version |
|------------|---------|
| Node.js    | ≥ 18    |
| Python     | ≥ 3.10  |
| npm        | ≥ 9     |

### One-Click Startup

Double-click the `START.bat` file in the root directory to start both the frontend and backend simultaneously:

```bat
START.bat
```

After startup:
- Frontend UI: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8000](http://localhost:8000)
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

### Manual Startup

**Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn src.main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

### First-Time Configuration

1. After startup, enter the game and open **Settings** (top-right menu → Settings, or click System in the experimental UI).
2. Fill in your API Key, Base URL, and the corresponding model name in the **AI Configuration** section.
3. Save your settings, and you are ready to start your exclusive story!

---

## 📖 Detailed Introduction

### Core Game Loop

```
Player types thoughts/dialogue → AI generates JSON response in real-time → Game parses and renders dialogue, characters, and backgrounds → Waits for the player's next move
```

The AI returns content in a structured JSON format, and the game system is responsible for rendering it beautifully into visual novel scenes. Each AI response can contain **multiple dialogue segments**, which players can click through one by one, just like playing a traditional Galgame.

### AI Response JSON Structure Reference

```json
{
  "messages": [
    {
      "id": 1,
      "name": "Character Name",
      "message": "Dialogue Content",
      "background": "background_image.png",
      "roles": [
        { "id": 1, "img": "character_sprite.png", "loc": "left" },
        { "id": 2, "img": "character_sprite.png", "loc": "right" }
      ]
    }
  ],
  "variables": {
    "Affection": "50",
    "Item": "Magic Book"
  },
  "time": {
    "time_id": 1,
    "con": "Summary of the current plot content"
  }
}
```

### Core Systems Overview

#### 🎭 Game Interface
- **Dialogue Box**: Exquisite glass-morphism style with a typewriter effect, click for smooth progression.
- **Character Sprites**: Supports multiple characters interacting on screen (left/right/center).
- **Scene Backgrounds**: Automatically and seamlessly switches scene images based on the AI's plot arrangements.
- **Bottom Action Bar** (Enabled in Experimental UI): Core functions like Save / Load / Time / System / Title stay persistently at the bottom for easy access.

#### 📖 World Book
- Allows you to inject your exclusive worldview and settings into the game! Relevant settings are automatically sent to the AI in the background via keyword matching.
- **Permanent Trigger**: Supports setting core entries that are always active without needing keyword matches.
- Supports exporting/importing your world book settings as JSON files to share with friends.

#### 📝 Prompt Editor
- The game's system prompts are saved as `.md` files. You can create multiple sets of prompts and switch between them at any time.
- Provides default AIgal role-playing rules, which you can edit freely to change the AI's narrative style or gameplay mechanics.

#### 🎨 Asset Manager
- Easily upload and manage your library of background images and character sprites.
- Provides a visual preview interface for assets, giving the AI a richer pool of visual resources to call upon.

#### 📊 Global Variables (Memory)
- The AI can decide to modify in-game variables itself (e.g., Affection +5, obtaining items, unlocking achievements, etc.), and these states are permanently saved.
- Every dialogue turn passes the current state back to the AI, enabling truly long-term memory across interactions.

#### ⏱️ Timeline of Destiny
- As the plot develops, the AI automatically records plot node summaries with incrementing `time_id`s.
- You can visually review the storyline you have traversed.
- **Timeline Rewind (Undo feature)**: Chose the wrong dialogue and hit a bad ending? Don't worry! Click the rewind button on a historical node, and the entire world (including all variables and dialogue history) will instantly reverse back to that moment!

#### 💾 Save / Load System
- Save your current timeline progress at any time (fully preserving dialogue history and a snapshot of variables).
- Offers multiple save slots to securely protect every part of your story.

#### 🔊 Text-to-Speech (TTS)
- Integrated with MiniMax's powerful voice model API to voice act your AI characters!
- You can enable **Auto-Read** in the settings, or click the play button in the bottom right corner of the dialogue box at any time to hear the current sentence.
- Features a robust **caching mechanism** so listening to voices again won't consume duplicate Tokens.

#### 🐛 Developer Mode (Debug Panel)
- Press `F12` in-game to bring up the exclusive built-in debug console (replacing the browser's native developer tools).
- Transparently view the **Original Request** and **Response** sent to the external LLM for every dialogue round.
- Supports **Hot Updating**: Manually modify the JSON data of the current dialogue, hit save, and the game screen will instantly sync with your changes!

#### ⚙️ Rich Settings
- AI Node Configuration (API Key / Base URL / Model)
- Freely adjust the context memory limit (set to 0 to feed the entire history to the AI).
- Adjustable text display speed and auto-play interval.
- Toggles for UI animations and layout modes.

### Two UI Interaction Modes

| Classic Mode | Experimental UI |
|--------------|-----------------|
| Top-right hamburger menu houses all features | Persistent bottom core action bar (Save / Load / Time / System / Title) |
| Feature panels open as side modal popups | Advanced settings (Prompts, World Book, etc.) are integrated into a separate `/settings` page |
| Enabled by default | Must be manually enabled in settings, ideal for heavy text-game players |

---

## 🛠️ Tech Stack Revealed

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | Core UI Framework |
| **TypeScript** | Ensures type safety for large projects |
| **Vite** | Lightning-fast build tool and development server |
| **Zustand** | Lightweight yet powerful state management |
| **Framer Motion** | Silky smooth UI animations and transition effects |
| **Axios** | Handles HTTP communication with the backend |
| **React Router** | Elegant single-page routing |

### Backend

| Technology | Purpose |
|------------|---------|
| **Python 3.10+** | Core Runtime |
| **FastAPI** | High-performance Web API Framework |
| **Uvicorn** | Lightning-fast ASGI Server |
| **httpx** | Asynchronous HTTP client to call LLM APIs without blocking |
| **Pydantic** | Rigorous data validation and model serialization |

### Purely Local Data Storage

- Uses a purely local JSON file storage solution, **no need to configure complex databases!**
- Your private data like world books, game saves, and system settings rest quietly in the `backend/data/` directory, completely guaranteeing data privacy.

### Project Directory Structure

```
aigal2/
├── START.bat                # One-click startup script
├── 1.json                   # AI response reference example
├── frontend/                # Frontend project
│   └── src/
│       ├── components/      # Basic UI components
│       │   ├── action-bar/      # Bottom action bar
│       │   ├── background-layer/# Background layer
│       │   ├── character-sprite/# Character sprites
│       │   ├── common/          # Common components
│       │   ├── dialogue-box/    # Dialogue box
│       │   ├── game-menu/       # Game menu
│       │   └── text-input/      # Player input box
│       ├── features/        # Core business modules
│       │   ├── asset-manager/   # Asset manager
│       │   ├── debug/           # Developer console
│       │   ├── prompt-editor/   # Prompt editor
│       │   ├── save-load/       # Save/load system
│       │   ├── settings/        # Game settings
│       │   ├── timeline/        # Timeline rewind
│       │   ├── ui-editor/       # Custom UI (experimental)
│       │   └── world-book/      # World book system
│       ├── pages/           # Page-level components
│       ├── store/           # Zustand global state
│       ├── services/        # API request wrappers
│       └── hooks/           # Custom React Hooks
└── backend/                 # Backend project
    ├── data/                # Local data storage repository
    │   ├── prompts/             # System prompt configurations
    │   ├── world_books/         # World book settings
    │   ├── saves/               # Game saves
    │   ├── tts_cache/           # TTS audio cache
    │   └── assets/              # Local asset library
    └── src/
        ├── ai/                  # LLM interaction logic
        ├── assets/              # Asset access routes
        ├── tts/                 # TTS synthesis routes
        ├── settings/            # Settings management routes
        └── world_book/          # World book routes
```

---

<p align="center">
  <em>AIgal — Let AI be your exclusive storyteller ✨</em>
</p>

