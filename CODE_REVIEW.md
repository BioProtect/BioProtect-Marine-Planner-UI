# Code Review: `newLock` vs `main` — BioProtect Frontend

Scope reviewed: ~96 changed files; focused on `src/` source changes. Standards applied: `CLAUDE.md` and `src/AGENTS.md`.

---

## Critical

No critical security issues found. No secrets in the diff, no `dangerouslySetInnerHTML`/`innerHTML` additions, no XSS sinks in map popups, and user-supplied values going into backend URLs (`uploadRasterCost` profile name/description, raster filename) are `encodeURIComponent`-wrapped.

---

## High

### H1. Raw `fetch` in a component — explicit invariant violation, and it bypasses the reauth flow
`src/RightInfoPanel/ResultsPanel.jsx:216-277` (`handleDownloadGis`)

CLAUDE.md: "All server state goes through RTK Query endpoints injected into `src/slices/apiSlice.js` — never `fetch`/axios directly from components." AGENTS.md: "Never call `fetch` directly." This handler builds the URL manually, pulls the token out of the store (`ResultsPanel.jsx:214`, `:237`) and calls `fetch` directly. Beyond the invariant, it skips `baseQueryWithReauth`'s 403 → `/refresh` path, so a download attempted with an expired access token fails outright instead of transparently re-authenticating.

**Fix:** add an `exportRuns` endpoint to `prioritizrApiSlice` using a `queryFn` (or `responseHandler: (r) => r.blob()`) so it flows through the shared base query, and keep the anchor-click download logic in the component. If a shared helper for binary downloads is genuinely needed, put it next to `apiSlice.js` and document the exception.

### H2. Server-side logout likely fires without credentials it needs — session may never be invalidated
`src/App.jsx:1010-1016` (`handleLogOut`)

`dispatch(logOut())` clears the token from the `auth` slice *before* `await logoutUser().unwrap()`. `prepareHeaders` (`src/slices/apiSlice.js:10-16`) reads the token from state, so the logout request goes out with no `Authorization` header. If the backend authenticates the logout endpoint via Bearer token it will 403 — and the newly added guard (`apiSlice.js:25-27`) correctly refuses to refresh because `isUserLoggedIn` is now false — so the HTTP-only refresh cookie is never invalidated server-side. The failure is swallowed with a `console.warn`.

**Fix:** call `logoutUser()` first (or snapshot the token before clearing and pass it explicitly), then clear local auth. The logged-out reauth guard can be preserved by setting a transient "loggingOut" flag instead of clearing the token first.

### H3. New backend endpoints added via the legacy JSONP `_get` helper instead of RTK Query — invariant violation
- `src/App.jsx:2851-2860` (`getRasterBandInfo`, via `_get` → JSONP)
- `src/App.jsx:3256-3263` (`fetchCostProfileActivities`, via `_get` → JSONP)

AGENTS.md: "New endpoint: add it to the relevant domain slice with `apiSlice.injectEndpoints`." These are plain GET/JSON endpoints with no reason to use JSONP. JSONP (`_get`, `src/App.jsx:623-654`) sends no `Authorization` header, has no reauth path, and executes the server response as script — a worse security posture than the shared fetch base query. It also forced the awkward hand-rolled loop guards (`lastProbedFilenameRef` in `CumulativeImpactDialog.jsx`, `fetchRef` in `PlanningUnitsTab.jsx`) plus manual `loading`/`error`/`cancelled` state in `PlanningUnitsTab.jsx:102-138` — all of which `useGetCostProfileActivitiesQuery(profileId)` would provide for free with caching.

**Fix:** inject `getRasterBandInfo` and `getCostProfileActivities` into the planning-unit/prioritizr domain slices and consume them with hooks; drop the ref-based fetch plumbing.

---

## Medium

### M1. PU status save: fire-and-forget, no error handling, and stale-state hazard on "Clear Edits"
`src/LeftInfoPanel/PlanningUnitsTab.jsx:273` (`updateProjectPus()` not awaited), `:298-325`

- If `_post("planning-units?action=update", ...)` rejects, the rejection is unhandled — the user gets no feedback and believes edits were saved.
- `localEditsRef` is never cleared after a successful save and the redux `planningUnits` prop is never refetched. Consequently `clearManualEdits` (`:286-296`) resets feature-state to `planningUnitStatusMap`, which is the *pre-save* server snapshot — after a successful save, "Clear Edits" visually reverts hexes that are in fact persisted, and a subsequent save would then re-derive `status1/status2` from stale base sets minus/plus stale edits.
- Also verify types: `Object.entries(localEdits)` yields string keys; if `planningUnits[1]`/`[2]` ever hold numeric puids (the click handler falls back to `feature.properties.puid || feature.id`), `base1.delete(h3)` silently misses.

**Fix:** `await updateProjectPus()` in a try/catch with a snackbar on failure; on success clear `localEditsRef` and refresh (or cache-patch) `planningUnits`; normalise puids to strings at the collection point.

### M2. Drag-paint select fights the click handler — clicks can appear to do nothing
`src/LeftInfoPanel/PlanningUnitsTab.jsx:178-247`

A press with 1–3 px of movement fires `mousemove` → `selectAtPoint` adds the hex, then (being under Mapbox's click tolerance) the map `click` handler fires and *toggles it back off*. Result: intermittent "my click didn't select anything." Also `stopPuEditSession` (`:250-274`) returns early when `puLayerId` is missing, leaving the canvas/window listeners attached and `dragPan` possibly disabled even though `setPuEditing(false)` already ran in `handlePUEditingClick`.

**Fix:** record whether the drag actually painted anything (e.g. `didPaintRef`) and make the click handler a no-op for that gesture; move listener cleanup above the early return in `stopPuEditSession`.

### M3. `PrioritizrResults` tag type is not registered in `createApi`
`src/slices/prioritizrApiSlice.js:34-36` (new `getFeatureRepresentation` `providesTags`) vs `src/slices/apiSlice.js:45` (`tagTypes: ["Features", "Project", "ProjectList"]`).

The tag existed before this branch, but the new endpoint extends reliance on it. Unregistered tag types trigger RTKQ dev warnings and mean nothing can invalidate these caches — e.g. after a new Prioritizr run completes, stale representation data for the same run-id set will be served forever (the sorted-run-ids cache key only isolates *different* selections).

**Fix:** add `"PrioritizrResults"` to `tagTypes` in `apiSlice.js`, and have the run-completion path invalidate it.

### M4. PDF download has no `catch` — unhandled rejection on failure
`src/RightInfoPanel/ResultsPanel.jsx:139-194`: `try { ... } finally { setPdfLoading(false); }`. If `generatePdfReport`, the canvas capture, or image decode throws, the user gets no snackbar and the console gets an unhandled rejection. `showMessage` is also missing from the `useCallback` deps (`:195-205`).

**Fix:** add `catch (err) { showMessage(...) }` and include `showMessage` in deps.

### M5. Login page regressions
`src/LoginPage.jsx`:
- `:190-193` `handleForgotPassword` is defined but never rendered — the forgot-password/reset entry point that existed on the old `LoginDialog` is gone from the UI (App still mounts `ResendPasswordDialog`/`ResetDialog`, but nothing opens them pre-login).
- `:173` `loadProjectAndSetup(response.project.id)` — if a user has no default project, this throws after a *successful* login and the catch (`:177-186`) reports "No Server Response", leaving the user stuck on the login page while actually authenticated. Guard `response.project?.id`.
- `:179-184` error mapping keys off `err.originalStatus`; `fetchBaseQuery` errors put the HTTP code in `err.status` (`originalStatus` only exists for parsing errors), so 400/401 will typically display the generic message. (Same pre-existing pattern in `apiSlice.js:22`.)

### M6. `window.colors` is read in four new places but never assigned anywhere in `src/`
`src/LeftInfoPanel/FeaturesList.jsx:131-132`, `src/LeftInfoPanel/PlanningUnitsTab.jsx:575-576`, `src/App.jsx:3220`, `src/features/featuresService.jsx:8-9`.

Every fallback branch always executes: activities always get `#F5C043`, and `FeaturesList` computes `color` as `undefined` when `item.color` is unset — while `featuresService.ensureFeatureColor` assigns a *random* hex at layer-add time — so the `WaveOverlay` colour will not match the actual map layer colour. Replace the phantom global with a palette exported from `bpVars.jsx` (or theme) and use it in both places.

### M7. Icon-conversion regression in log items
`src/RightInfoPanel/LogItem.jsx:26-32`: the "Upload Complete" branch was green with FontAwesome but is now `color: "error.main"` (red) — clearly a copy-paste from the error branch during the MUI migration. Should be `success.main`.

### M8. `theme.shape.radius` is not a MUI key
`src/theme.js:60-62`: MUI reads `shape.borderRadius`; `radius` is silently ignored (nothing in `src/` reads it either). Rename to `borderRadius: 10` or delete.

---

## Low

- **L1.** `src/LeftInfoPanel/PlanningUnitsTab.jsx:567` — `overflowY: "none"` is not a valid CSS value (use `"auto"`/`"hidden"`); as written the activities list will not scroll despite the `maxHeight`.
- **L2.** `src/LeftInfoPanel/PlanningUnitsTab.jsx:442` — `sx={{ color: "##96969600" }}` double hash, invalid colour (carried over from the old code, still wrong).
- **L3.** User-facing typos: "Mannually" (`PlanningUnitsTab.jsx:348`), "Run Prioitizr" button label (`src/LeftInfoPanel/InfoPanel.jsx:343`) plus the `runPrioitizr` identifier family in `App.jsx`/`RunPrioritizrDialog.jsx`.
- **L4.** Unused code: `ResultsPanel.jsx:17-18` `HexagonIcon`/`HexagonOutlinedIcon` imports; `ActivityListItem.jsx` imports `IconButton`, `Stack`, `MoreVertIcon`, `grey` and takes an `onMenuClick` prop, none used; `LoginPage.jsx:190` dead handler (see M5).
- **L5.** `src/features/FeaturesDialog.jsx` delete-confirm dialog nests `<p>` and `<b>` inside `DialogContentText` (which renders a `<p>`) — invalid DOM nesting, React will warn. Use `component="div"` or plain `Typography`.
- **L6.** `src/slices/featureSlice.js:20-26` — delete via `method: "GET"` with unencoded `feature=${featureName}`; server API legacy, but at minimum wrap in `encodeURIComponent` (same for `FeaturesDialog.jsx` caller).
- **L7.** `src/App.jsx:1743` — `preserveDrawingBuffer: true` is now always on for the screenshot feature; this disables some GPU optimisations and measurably affects Mapbox render performance on low-end devices. Acceptable trade-off, but worth a comment/benchmark note.
- **L8.** `index.html` — new Google Fonts `<link>` sends every visitor's IP to Google; for an EU Horizon project, self-hosting via `@fontsource/plus-jakarta-sans` (you just removed `@fontsource/roboto`) avoids the GDPR question. Also the FontAwesome CDN stylesheet is still loaded even though all FA usage was removed from the code — dead render-blocking request that can be deleted.
- **L9.** `src/MenuBar/MenuBar.jsx` (multiple) and `src/User/ServerDetails/ServerDetailsDialog.jsx` — `title` passed to MUI `SvgIcon` components (`<FolderOpenIcon title="Projects" />`) does nothing; the prop is `titleAccess` (or wrap in `Tooltip`). Small accessibility regression versus the old FA icons.
- **L10.** `src/LoginPage.jsx:406` — `alignItems: "left"` is not a valid flexbox value (use `flex-start`).
- **L11.** `src/Impacts/CumulativeImpactDialog.jsx:200-222` — the `lastProbedFilenameRef` guard means a *failed* band-info probe is never retried for the same filename until it changes; reset the ref on failure.
- **L12.** `src/RightInfoPanel/ResultsPanel.jsx:130` / `src/LeftInfoPanel/FeaturesList.jsx` — representation lookups key by `feature_unique_id` from the server but index with `item.id`/`uid = f.feature_unique_id ?? f.id`; the two components resolve the id differently. If `id !== feature_unique_id` for any feature, one of them silently shows no result. Centralise the id resolution.

---

## What's good

- The reauth-skip-on-logout guard (`apiSlice.js:22-27`) implements exactly the invariant AGENTS.md documents, with a comment explaining why.
- `deleteFeature` correctly converted from query to mutation with `invalidatesTags` (`featureSlice.js:20-26`), and the delete UX (confirm dialog, per-row permission gating with reasons, client checks mirroring backend enforcement) in `FeaturesDialog.jsx` is solid.
- Large-scale FontAwesome → `@mui/icons-material` migration matches the CLAUDE.md invariant; heavy dependency pruning (`axios`, `recharts`, `react-hexagon`, etc.) and deletion of all `* copy.jsx` dead files is real housecleaning.
- `generatePdfReport.js` is self-contained, uses no network access, sanitises the output filename, and handles image-load failure gracefully.
- Console.log cleanup throughout; dialog visibility remains in redux per AGENTS.md.

---

## Overall assessment

This is a large, mostly-healthy branch: UI modernisation (theme, login page, panels), a genuinely improved select-then-apply PU editing model, and useful new export features. The blocking concerns before merge are the three High items: the raw `fetch` GIS download (documented invariant violation that also breaks token refresh), the logout ordering bug (server session may never be invalidated), and new endpoints routed through the legacy JSONP helper instead of RTK Query. The Medium items around PU-edit save error handling/stale state (M1/M2) should also be addressed since planning-unit locking is the headline feature of this branch; the rest are polish.
