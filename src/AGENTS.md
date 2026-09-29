# src — BioProtect App

## Purpose

Single-page app for spatial conservation planning: users manage planning grids, features (species/habitat layers), and projects, then run Prioritizr analyses on the server and view results on a Mapbox map.

## Entry Points

- `index.jsx` — mounts the app (Redux store, theme, snackbar provider)
- `App.jsx` — **the god component** (~134KB). Owns the Mapbox map instance, dialog open/close orchestration, and most cross-domain workflows. Most feature work touches it. Prefer extracting logic into slices/hooks over growing it further.
- `bpVars.jsx` — `CONSTANTS` and `INITIAL_VARS` shared app-wide

## Layout

- `slices/` — Redux Toolkit state, one slice per domain (`auth`, `user`, `project`, `feature`, `planningUnit`, `prioritizr`, `ui`). API endpoints are RTK Query endpoints injected per-domain into the shared `apiSlice`.
- `store/` — store setup plus RTKQ cache helpers (see Patterns)
- `features/`, `projects/`, `planningGrids/` — domain dialogs/menus/services
- `LeftInfoPanel/`, `RightInfoPanel/`, `MenuBar/`, `HexInfo/` — main UI panels; `HexInfo` is the planning-unit inspection popover
- `BPComponents/` — shared table/panel primitives (`BioprotectTable`, `PanelHeader`)
- `hooks/` — snackbar helpers, `usePlanningGridWebSocket`
- `User/`, `Uploads/`, `Impacts/` — user admin, file import, impact analysis

## Contracts & Invariants

- **All HTTP goes through RTK Query.** `slices/apiSlice.js` defines the base query with auth headers and 403→`/refresh` reauth. Domain slices inject endpoints into it. Never call `fetch` directly.
- The reauth flow deliberately skips refresh when the user has logged out (prevents the HTTP-only refresh cookie from silently re-authenticating). Don't "simplify" that guard away.
- Auth token lives in the `auth` slice; requests use `credentials: "include"` plus a Bearer header.
- Long-running server jobs (grid/feature creation, Prioritizr runs) report progress over WebSockets — `WebSocketHandler.jsx` and `hooks/usePlanningGridWebSocket.jsx` — not polling.
- Import via path aliases (`@slices/...`, `@features/...`, etc. from `vite.config.ts`), not `../../` chains.

## Patterns

- To update cached server data after a mutation or WebSocket message, patch the RTKQ cache via `store/featureCacheActions.jsx` / `store/rtkqCacheHelpers.js` rather than refetching or holding a duplicate copy in a slice. The helpers tolerate both `[...]` and `{ data: [...] }` response shapes.
- New endpoint: add it to the relevant domain slice with `apiSlice.injectEndpoints`, tag with the existing tag types (`Features`, `Project`, `ProjectList`) for invalidation.
- Dialog visibility is Redux state (`uiSlice` `toggleDialog` and per-domain toggles), rendered from `App.jsx` — not local component state.
- User-facing notifications go through notistack via `hooks/useAppSnackbar.jsx`.
- Tables use `BPComponents/BioprotectTable` rather than raw MUI tables.

## Anti-patterns

- Don't add new state or handlers to `App.jsx` if they can live in a slice or hook.
- Don't store copies of RTK Query data in slices — patch the cache instead.
- Don't bypass `uiSlice` for dialog visibility.
