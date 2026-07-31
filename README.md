# Dart Tracker

A mobile-first darts scoring PWA for tracking a single player's game, dart by dart. It runs locally, works offline after installation, and stores the current game in the browser—no account or backend required.

## Features

- Configurable starting score and round limit
- Three-dart draft with a live projected score
- Singles, doubles, triples, bull, bullseye, and misses
- Standard double-out checkout and bust rules
- Scrollable round history and end-game statistics
- Current-game persistence with IndexedDB
- Installable, offline-capable PWA
- One-click reset for starting a new game

## Requirements

- [Bun](https://bun.sh/) 1.3 or newer

## Development

```powershell
bun install
bun run dev
```

Open <http://localhost:3000>.

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the Bun development server with hot reload |
| `bun run typecheck` | Check TypeScript types |
| `bun run lint` | Run Oxlint |
| `bun test` | Run the Bun test suite |
| `bun run test:watch` | Run tests in watch mode |
| `bun run build` | Create the production PWA in `dist/` |

## Production

```powershell
bun run build
```

Deploy the contents of `dist/` to any path on an HTTPS origin, including a GitHub Pages project path such as `/trix/`. The build generates a path-relative service worker that caches the application shell for offline use.

## Gameplay rules

Each round contains three editable dart slots, initially set to `Miss`. Submitting applies scoring sequentially. A checkout must finish on a double, including double bull. A bust restores the score from the start of the round and records zero points for that round.

Starting a new game clears the saved game, round history, and statistics before returning to setup.

## Technology

React, TypeScript, Bun, Tailwind CSS, IndexedDB, and Oxlint. Vite and Vitest are not used.

## License

[MIT](LICENSE)
