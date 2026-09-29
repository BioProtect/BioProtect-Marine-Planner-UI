# Code Review: `newLock` vs `main` — BioProtect Frontend

Two independent review passes were run against this branch (merge-base `5846fed`, 26 commits, 96 files, +4677/−5750). Standards applied: `CLAUDE.md` and `src/AGENTS.md`. **Pass 1** is below; **Pass 2** (a second, more focused sweep of the planning-unit editing feature) follows after it. The two agree on the RTK Query / logout / JSONP issues; Pass 2 additionally elevates the "Clear Edits" stale-state bug to Critical and adds several findings not in Pass 1 (notably the phantom `puEditing` guard, the missing selection-layer teardown, and the cross-project ref bleed). Read both.

---

# Pass 1

Scope reviewed: ~96 changed files; focused on `src/` source changes.

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

---

# Pass 2

A second sweep focused on the headline select-then-apply planning-unit editing feature. Severity numbering is independent of Pass 1 (Pass 2's C1 corresponds to Pass 1's M1, raised to Critical; Pass 2's H2 ≈ Pass 1's M2; Pass 2's M3 ≈ Pass 1's H1+H3).

---

## Critical

### C1. "Clear Edits" after a save can silently revert saved planning-unit statuses on the server
`src/LeftInfoPanel/PlanningUnitsTab.jsx:286-296` (`clearManualEdits`), `:298-325` (`updateProjectPus`), `:273` (`stopPuEditSession`)

Three compounding defects:
1. `updateProjectPus` POSTs via legacy `_post("planning-units?action=update")` but never invalidates/patches the RTKQ `getProject` cache, so the `planningUnits` prop (from `projectResp.planning_units`, `App.jsx:194`) stays **stale** after a save. Violates the AGENTS.md pattern "patch the RTKQ cache via featureCacheActions/rtkqCacheHelpers rather than refetching or holding a duplicate copy."
2. `localEditsRef` is never cleared after a successful save.
3. `clearManualEdits` repaints from `planningUnitStatusMap`, which is built from that stale cache.

Failure scenario: Edit → lock in hexes → Save (server updated, cache not). Edit again → click **Clear Edits** (`localEditsRef = {}`, map repainted to pre-save state) → Save. `updateProjectPus` now posts the stale `planningUnits[1]`/`planningUnits[2]` lists with zero local edits — the server is reverted to its pre-first-save state with no warning. Silent data loss.

**Fix:** after a successful POST, patch the `getProject` cache's `planning_units` (or `refetchProject()`), and clear `localEditsRef`. Better: make this an RTKQ mutation with `invalidatesTags` on the project (see M3).

Related sub-bug: `clearManualEdits` only resets feature-state for ids present in `planningUnitStatusMap`. A hex that was **default (status 0)** and locally edited is not in that map, so its painted status is never reset — "Clear Edits" visibly fails for exactly the most common edit. Iterate `Object.keys(localEditsRef.current)` and reset each to `planningUnitStatusMap[id] ?? 0`.

---

## High

### H1. Tab-switch guard reads a Redux field that doesn't exist → edit-session listeners leak and left-drag panning breaks permanently
`src/LeftInfoPanel/InfoPanel.jsx:268-269, 339` vs `src/App.jsx:253` and `src/slices/planningUnitSlice.js`

`InfoPanel` disables the Project/Features tabs and the Run button with `puState.puEditing`, but `planningUnitSlice` has **no `puEditing` field** — the real flag is local `useState` in `App.jsx:253`. `puState.puEditing` is always `undefined`, so the tabs are never disabled and the user can switch tabs mid-edit-session.

When that happens, `PlanningUnitsTab` unmounts and — because it has **no unmount cleanup effect** — the `mousedown`/`mousemove` canvas listeners and the window `mouseup` listener from `startPuEditSession` (`PlanningUnitsTab.jsx:241-247`) leak permanently. `boxSelectHandlersRef` dies with the component instance, so even returning to the tab and clicking "Save" can never remove them (`stopPuEditSession:263-271` finds `boxSelectHandlersRef.current === null` in the new instance). Consequences for the rest of the session:
- every left-button `mousedown` on the map disables `dragPan` (`onMouseDown:227-231`) → left-drag panning is dead app-wide;
- every mouse move while a button is down keeps painting `selected: true` feature-state onto hexes outside any edit session;
- `App.jsx` `puEditing` stays `true`, so the remounted tab shows "Save" for a session that no longer exists.

**Fix (two parts):** (a) add a `useEffect(() => () => { /* remove listeners, re-enable dragPan, reset cursor */ }, [])` cleanup in `PlanningUnitsTab`; (b) move `puEditing` into `planningUnitSlice` as the single source of truth — this also satisfies the AGENTS.md anti-pattern rule "Don't add new state or handlers to App.jsx if they can live in a slice."

### H2. Click-select and drag-paint fight each other on micro-drags — clicking a hex often no-ops
`src/LeftInfoPanel/PlanningUnitsTab.jsx:178-201` (click toggle) vs `:208-235` (drag paint)

Mapbox fires `click` after `mouseup` unless cursor movement exceeded `clickTolerance` (default 3 px). For a normal click with 1–2 px of jitter: `mousemove` fires → `selectAtPoint` **adds** the hex; then `click` fires → the toggle sees `selectedIdsRef.current.has(puid)` and **removes** it. Net result: clicking a hex intermittently does nothing, depending on sub-3-pixel hand jitter. Presents as "selection is flaky."

**Fix:** set a `didPaint = false` flag in `onMouseDown`, set it `true` in `selectAtPoint` when anything is added, and skip the toggle in the click handler when `didPaint` is true.

### H3. Save is fire-and-forget; failed saves exit edit mode as if they succeeded
`src/LeftInfoPanel/PlanningUnitsTab.jsx:272-273`

`stopPuEditSession` calls `clearSelection()` (silently discarding any selected-but-unapplied hexes) then `updateProjectPus()` without `await` or `.catch()`. `_post` rethrows after its snackbar (`App.jsx:688-692`), so this produces an unhandled promise rejection, and the UI has already left edit mode with the edited statuses painted on the map — even though the server was never updated. There is also no success feedback and the POST fires on every Save click even with zero edits.

**Fix:** `await` it, keep the session open (or offer retry) on failure, skip the POST when `Object.keys(localEditsRef.current).length === 0`, and show a success snackbar via `useAppSnackbar`.

---

## Medium

### M1. Asymmetric early-returns leave the edit session half-started / half-stopped
`src/LeftInfoPanel/PlanningUnitsTab.jsx:168-175, 250-255`

`startPuEditSession` dispatches `setShowPlanningGrid(true)` and sets the crosshair cursor **before** bailing when `puLayerId` is missing, and `handlePUEditingClick:276-284` has already set `puEditing = true`. The button now says "Save" for a session with no listeners; clicking it hits `stopPuEditSession`'s own early-return (`:252-255`), which bails **before** resetting the cursor or calling cleanup — the crosshair cursor sticks forever. Do the `puLayerId` guard first, before any state/cursor mutation, and don't flip `puEditing` until the session actually started.

Also: `setShowPlanningGrid` is dispatched here but nothing consumes `showPlanningGrid` (only the slice definition at `planningUnitSlice.js:41,71` and a commented-out block in `InfoPanel.jsx:184-187`) — both dispatches are dead code. Selection-layer visibility is actually driven by `loadCostsLayer` (`App.jsx:3472-3476`), so if `getPuCostsLayer` throws when the PU tab opens, the cyan selection borders are invisible for the whole edit session while selection still "works" invisibly. Consider making the edit session itself show the selection layer.

### M2. `removePlanningGridLayers(puLayerName)` targeted path misses the new selection layer → `removeSource` will throw
`src/App.jsx:2320-2328`

`layersToRemove` lists results/costs/pu/status but not `martin_layer_selection_${puLayerName}` (added in e54abb5). `removeMapSource` (`App.jsx:2396`, no guard/try-catch) then throws "Source ... cannot be removed while layer ... is using it." The targeted branch is currently dead (the only call site, `:2093`, passes no argument) but it's a landmine for the next caller. Add the selection layer id to the list.

### M3. New endpoints bypass RTK Query — invariant violation, and downloads bypass the 403→refresh reauth
- `src/RightInfoPanel/ResultsPanel.jsx` (GIS export, `handleDownloadGis`): raw `fetch` with a manually attached Bearer header. Explicitly violates CLAUDE.md/AGENTS.md ("All HTTP goes through RTK Query... Never call fetch directly"). Concrete failure: an expired access token 403s and the download just fails, instead of going through the `baseQueryWithReauth` `/refresh` path every other request gets. A blob download can still be an injected RTKQ endpoint with `responseHandler: (r) => r.blob()`.
- New endpoints routed through legacy `_get` (JSONP) / `_post`: `planning-units?action=update` (`PlanningUnitsTab.jsx:324`), `getCostProfileActivities` (`App.jsx:3256-3263`), `getRasterBandInfo` (`App.jsx:2854`), `setActiveCostProfile` (`App.jsx:3510`), `planning-units?action=get-cost-layer` (`App.jsx:3498`). AGENTS.md: "New endpoint: add it to the relevant domain slice with `apiSlice.injectEndpoints`." Note also that `setActiveCostProfile` and the raster-cost flow are **state-mutating GETs over JSONP** — no CSRF protection and JSONP executes server-returned script; worth migrating these first.

### M4. `handleDownloadPdf` has `try/finally` with no `catch`
`src/RightInfoPanel/ResultsPanel.jsx` (PDF handler)

Any error (canvas capture, jsPDF, image decode) becomes an unhandled rejection; the user sees the spinner stop with no explanation. Add a `catch` that calls `showMessage`.

### M5. `localEditsRef` and selection survive project switches
`src/LeftInfoPanel/PlanningUnitsTab.jsx:71-77`

Neither `localEditsRef` nor `selectedIdsRef` is reset when `project?.id` changes (the component doesn't remount on project switch). Unsaved edits from project A can be merged into project B's `updateProjectPus` payload. Add an effect keyed on `project?.id` that resets both refs, `selectionCount`, and (if active) tears down the edit session.

### M6. Crash risk: `Object.entries(planningUnits)` with undefined prop
`src/LeftInfoPanel/PlanningUnitsTab.jsx:60-68` — `planningUnits` is `projectResp?.planning_units` (`App.jsx:194`), which is `undefined` until the project query resolves. If the PU tab is mounted at that moment, `Object.entries(undefined)` throws and takes the panel down. Guard with `planningUnits ?? {}` (same for `applyStatusToSelection:156` and `clearManualEdits:287`, which destructure `puLayerIdsRef.current` without the null-guard `clearSelection` has).

---

## Low

- `PlanningUnitsTab.jsx:442` — `sx={{ color: "##96969600" }}`: double `#`, invalid color; the "Default" legend hexagon renders in the inherited color, not the intended transparent grey.
- `PlanningUnitsTab.jsx:567` — `overflowY: "none"` is not a valid CSS value (want `"auto"`/`"hidden"`); long activity lists will overflow the 40vh box.
- `PlanningUnitsTab.jsx:346-348` — helper text says "drag a box" but the interaction is a brush (the commit message itself says "not a bounding box"); also typo "Mannually". `InfoPanel.jsx:343` — "Run Prioitizr" typo (user-facing button).
- `App.jsx:421-423` — unmount cleanup calls `map.off("click", CONSTANTS.PU_LAYER_NAME, ...)` but the handler is registered on the dynamic id `martin_layer_pu_${name}` (`PlanningUnitsTab.jsx:202`); the off() is a silent no-op. Harmless today (App unmount ≈ page teardown) but misleading.
- `theme.js:60-62` — `shape: { radius: 10 }` is a silent no-op; MUI reads `shape.borderRadius`.
- `index.html:44-46` — FontAwesome 5.0.10 CSS is still loaded from CDN even though the branch removed all FontAwesome packages (commit e9cb2cb); dead external request, drop it.
- `PlanningUnitsTab.jsx:13` — `CONSTANTS` import is unused.
- `window.colors` palette indexing is now duplicated in four places (`PlanningUnitsTab.jsx:575`, `FeaturesList.jsx:131`, `App.jsx:3220`, `featuresService.jsx:8`) — extract a `getPaletteColor(id)` util; global `window` state is fragile.
- No tests were added anywhere on a ~4700-line branch; the select-then-apply set logic (`updateProjectPus` merge) is pure and eminently unit-testable with Vitest.

---

## Invariant compliance summary (Pass 2)

| Invariant | Status |
|---|---|
| ES modules; JSX only in `.jsx` | Pass (`theme.js`, `generatePdfReport.js` are JSX-free) |
| Path aliases, no deep relative chains | Pass for new code (`@utils` alias added to `vite.config.ts`; the one `../../MarxanDialog` in ServerDetailsDialog pre-dates the branch) |
| All HTTP via RTK Query in `apiSlice.js` | **Violated** by new code (M3) |
| MUI 5 + `@mui/icons-material` over inline SVGs | Pass — FontAwesome fully removed; remaining inline SVGs (LoginPage contours, WaveOverlay) are decorative artwork, not icons |
| Reauth logout guard preserved | Pass — the branch *adds* the documented guard (`apiSlice.js:23-27`) |
| Dialog visibility via `uiSlice` | Pass |
| Cache patching over duplicate slice copies | **Violated** by the PU-status save path (C1) |

---

## Verdict (Pass 2)

**Not merge-ready.** The headline select-then-apply feature is a genuine UX improvement and the window-bound `mouseup` correctly fixes the released-outside-canvas case it targets, but the feature has one silent server-side data-loss path (C1), a listener/dragPan leak reachable through an ineffective guard (H1), and a flaky-click interaction bug (H2). C1, H1, H2 and H3 should be fixed before merge; M1–M6 are strongly recommended in the same pass since they all touch the same code. The rest of the branch (theme, PDF report, logout hardening, slice cleanups, FontAwesome removal) is in good shape.
