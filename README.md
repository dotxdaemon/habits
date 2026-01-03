# 習慣 | Habits - Minimalist Habit Tracker PWA

A fast, offline-first habit tracker with streak counting, completion stats, and zen aesthetics.

## Features

- **Two Habit Types**:
  - **Checkbox**: Simple yes/no completion (e.g., "Meditate", "Read")
  - **Amount**: Track quantity with targets (e.g., "Drink 8 glasses of water", "Run 5 miles")

- **Streak Tracking**: Visual streak counter that updates daily

- **Completion Stats**: 30-day completion rate with 7-day mini calendar

- **Offline-First**: Works completely offline with IndexedDB + localStorage

- **Clean UI**: Minimalist design inspired by Japanese aesthetics

- **Import/Export**: JSON-based data backup and migration

- **PWA**: Install on mobile/desktop, works like a native app

## Setup

### Prerequisites

- Node.js 18+ and pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test
```

## PWA Installation

### Mobile (iOS/Android)

1. Open the app in your mobile browser
2. **iOS**: Tap Share → "Add to Home Screen"
3. **Android**: Tap menu (⋮) → "Install app"

The app will appear on your home screen and work offline.

### Desktop (Chrome/Edge)

1. Open the app in your browser
2. Look for the install icon (⊕) in the address bar
3. Click "Install"

## Usage

### Creating Habits

1. Click "+ Add Habit"
2. Enter habit name
3. Choose type:
   - **Checkbox** for yes/no habits
   - **Amount** for quantity-based habits (set target and unit)
4. Click "Create"

### Tracking Daily

**Today Tab:**
- Checkbox habits: Tap to toggle complete/incomplete
- Amount habits: Use +/- buttons to adjust value
- Streak counter shows consecutive days completed

**Trends Tab:**
- View 30-day completion percentage
- See 7-day mini calendar for each habit
- Export/import your data

### Streaks

- Streaks count consecutive days of completion
- If today is incomplete, streak starts from yesterday
- Checkbox habit: Complete when checked
- Amount habit: Complete when value ≥ target

### Exporting Data

1. Go to "Trends" tab
2. Tap "Export Data"
3. Copy JSON to clipboard
4. Save to file or share via email/cloud

### Importing Data

1. Go to "Trends" tab
2. Tap "Import Data"
3. Paste your JSON export
4. Data will replace current habits and logs

## Data Model

### Storage

- **IndexedDB**: Habits metadata
- **localStorage**: Daily logs (keyed by YYYY-MM-DD)

### Habits Table

```typescript
{
  id: string;           // Unique identifier
  name: string;         // "Meditate", "Drink water"
  type: 'checkbox' | 'amount';
  target?: number;      // For amount type
  unit?: string;        // "glasses", "minutes", "pages"
  createdAt: string;    // YYYY-MM-DD
}
```

### Logs Structure

```typescript
{
  "2026-01-03": {
    "habit-id-1": { done: true },
    "habit-id-2": { value: 8 }
  }
}
```

### Export Format

```json
{
  "habits": [...],
  "logs": { ... },
  "exportedAt": "2026-01-03T17:00:00.000Z"
}
```

## Design Philosophy

### Minimalist

- No accounts, no login
- No gamification or badges
- Just habits, streaks, and stats
- Japanese-inspired aesthetics (stone color palette)

### Privacy-First

- No analytics or tracking
- No external API calls
- Data stays on your device
- Export/import for user-controlled backups

### Offline-First

- All data stored locally
- No network required after initial load
- Service worker caches app shell
- Works on planes, trains, anywhere

### Mobile-Optimized

- One-thumb-quick interactions
- Large tap targets (44px+)
- Dark theme by default (stone palette)
- Smooth animations, reduced motion support

## Architecture

### Layers

```
src/
├── db/          # Dexie (IndexedDB) + localStorage
├── domain/      # Streak calculation, completion stats
├── pages/       # TodayView, TrendsView
└── store.ts     # Zustand state management
```

### Domain Logic

**Streaks** (`src/domain/streaks.ts`):
- Calculate current streak (consecutive days)
- Calculate completion rate (30-day percentage)
- Get last 7 days for mini calendar
- Format dates for display

**Storage** (`src/db/queries.ts`):
- CRUD operations for habits
- Log operations (get, update, toggle)
- Export/import with validation

## Testing

All domain logic is tested:

```bash
pnpm test
```

Tests cover:
- Streak calculation (edge cases)
- Completion rate calculation
- Multi-day history tracking
- Date formatting

## Future Features (v1.1)

- Habit categories/tags
- Custom colors per habit
- Notes per daily log
- Reminder notifications (PWA)
- Monthly/yearly views
- Longest streak ever stat
- Habit archiving

## Contributing

Contributions welcome! Please:

1. Write tests for new features
2. Follow existing code style
3. Keep dependencies minimal
4. Maintain offline-first approach
5. No analytics or tracking

## License

MIT License

## Credits

Built with:
- [React](https://react.dev) - UI framework
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Vite](https://vitejs.dev) - Build tool
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Dexie](https://dexie.org) - IndexedDB wrapper
- [Zustand](https://zustand-demo.pmnd.rs) - State management
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app) - PWA support

---

**Made for building lasting habits. No accounts, no tracking, no cloud lock-in.**
