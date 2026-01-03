# Grocery List - Smart Shopping PWA

A fast, offline-first grocery list app with intelligent item parsing, category-based sorting, and one-thumb-quick mobile experience.

## Features

- **Smart Quick Add**: Parse quantities, units, and item names automatically
  - "2 milk" → 2× milk
  - "1.5 lb chicken" → 1.5 lb chicken
  - "apples 3" → 3× apples

- **Category-Based Organization**: Items auto-categorized (Produce, Dairy, Meat, Pantry, Frozen, Bakery, Household, Other)

- **Flexible Sorting**: Category-based or manual ordering, with purchased items at top or bottom

- **Offline-First**: Works completely offline with IndexedDB storage

- **Multiple Lists**: Create separate lists for different stores (Costco, Safeway, etc.)

- **Search & Filter**: Quickly find items within your list

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

# Run E2E tests (after implementation)
pnpm e2e
```

## PWA Installation

### Mobile (iOS/Android)

1. Open the app in your mobile browser
2. **iOS**: Tap the Share button → "Add to Home Screen"
3. **Android**: Tap the menu (⋮) → "Install app" or "Add to Home Screen"

The app will appear on your home screen and work offline.

### Desktop (Chrome/Edge)

1. Open the app in your browser
2. Look for the install icon (⊕) in the address bar
3. Click "Install" in the prompt
4. The app opens in its own window

## Usage

### Creating Lists

1. On the home screen, click "+ Create New List"
2. Name your list (e.g., "Weekly Shop", "Costco Run")
3. Click "Create"

### Adding Items

Use the quick-add input at the bottom of any list:

- Type naturally: `2 milk`, `1.5 lb chicken breast`, `apples x3`
- Press Enter or tap "Add"
- Items are automatically categorized and sorted

### Managing Items

- **Check off**: Tap the checkbox to mark purchased
- **Delete**: Tap the × button
- **Search**: Use the search bar to filter items
- **Clear purchased**: Remove all checked items with one tap
- **Toggle placement**: Move purchased items to top or bottom

### Exporting Data

1. Open any list
2. Tap "Export" in the header
3. Copy the JSON to clipboard or save the file
4. Share via email, cloud storage, etc.

### Importing Data

1. Open any list (or create a new one)
2. Tap "Import"
3. Paste your JSON export
4. Choose "Replace" to overwrite or "Merge" to combine

## Data Model

### Storage (IndexedDB)

- **lists**: grocery lists with metadata and sort configuration
- **items**: individual grocery items with quantity, unit, category, notes
- **categories**: 8 default categories with custom ordering
- **itemHistory**: autocomplete suggestions and favorites (v1.1)
- **storeProfiles**: custom aisle orders per store (v1.1)

### Export Format

```json
{
  "lists": [...],
  "items": [...],
  "categories": [...],
  "itemHistory": [...],
  "storeProfiles": [...],
  "exportedAt": "2026-01-03T17:00:00.000Z"
}
```

## Design Philosophy

### Offline-First

- All data stored locally in IndexedDB
- No network required after initial load
- Service worker caches app shell for instant loading

### Privacy-First

- No analytics or tracking
- No external API calls
- Your data stays on your device
- Export/import for user-controlled backups

### Mobile-Optimized

- One-thumb-quick interactions
- Large tap targets (44px+)
- Sticky header and fixed quick-add input
- Keyboard-friendly on desktop

### Smart Defaults

- Auto-categorization based on common groceries
- Sensible sort order (category → alphabetical)
- Remember item history for autocomplete
- No configuration needed to get started

## Architecture

### Layers

```
src/
├── db/          # Dexie (IndexedDB) schema and queries
├── domain/      # Business logic (parsing, sorting, inference)
├── ui/          # Reusable React components
├── pages/       # Top-level views (Lists, List Detail)
└── store.ts     # Zustand state management
```

### Domain Logic

**Parsing** (`src/domain/parsing.ts`):
- Regex-based quantity/unit extraction
- Fuzzy matching for autocomplete
- Preserves original input for safety

**Sorting** (`src/domain/sorting.ts`):
- Category-based grouping with user-defined order
- Purchased/unpurchased split
- Manual drag-and-drop mode (v1.1)
- Alphabetical within categories

**Category Inference** (`src/domain/sorting.ts`):
- Keyword matching for common items
- Item history lookup
- Falls back to "Other" for unknown items

## Future: Cloud Sync (v2)

*Note: v1 is fully self-contained with no cloud dependencies. Cloud sync is a planned future feature.*

### Approach Options

**Option A: Simple Token-Based Sync**
- Generate unique sync code per device
- POST JSON to serverless endpoint (Cloudflare Workers, Vercel, etc.)
- Other devices fetch via same code
- Time-limited (24-48 hours), auto-expire
- No accounts, no authentication

**Option B: CRDTs for Real-Time Sync**
- Conflict-free replicated data types
- WebSocket or long-polling for live updates
- Works with Yjs, Automerge, or custom CRDT layer
- More complex but supports true multi-device collaboration

**Option C: End-to-End Encrypted Sync**
- User-generated encryption key (passphrase or QR code)
- Encrypted JSON stored in cloud (S3, R2, etc.)
- Client-side decrypt only
- Maximum privacy, no server can read data

### Recommended: Start with Option A

- Minimal server requirements
- Easy to self-host
- Maintains privacy-first philosophy
- Can migrate to Options B/C later

## Contributing

Contributions welcome! Please:

1. Write tests for new features
2. Follow existing code style (ESLint + Prettier)
3. Keep dependencies minimal
4. Maintain offline-first approach
5. No analytics or tracking dependencies

## License

MIT License - see LICENSE file

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

**Made for fast, friction-free grocery shopping. No accounts, no tracking, no cloud lock-in.**
