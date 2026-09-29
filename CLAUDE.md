# BioProtect Frontend

Web client for BioProtect, a spatial conservation planning tool built on Prioritizr (Marxan lineage). React 18 + Vite + MUI 5 + Redux Toolkit (RTK Query) + Mapbox GL. Talks to a `marxan-server` backend over REST (RTK Query) and WebSockets (long-running jobs).

## Commands

- `npm start` — Vite dev server on http://localhost:4500
- `npm test` — Vitest
- `npm run build` — production build into `build/`

Backend URL comes from `VITE_API_BASE_URL` (see `src/config/api`); a running marxan-server instance is required for most functionality.

## Intent Layer

**Before modifying code in a subdirectory, read its AGENTS.md first** to understand local patterns and invariants.

- **Source**: `src/AGENTS.md` — app architecture, state management rules, path aliases

### Global Invariants

- ES modules only (`"type": "module"`); JSX lives in `.jsx` files.
- Import via the path aliases defined in `vite.config.ts` (`@slices`, `@features`, `@store`, etc.), not deep relative paths.
- All server state goes through RTK Query endpoints injected into `src/slices/apiSlice.js` — never `fetch`/axios directly from components.
- MUI 5 components for UI; prefer `@mui/icons-material` icons over inline SVGs.
