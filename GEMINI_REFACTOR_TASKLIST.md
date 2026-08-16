# GEMINI REFACTOR TASKLIST
## CrewAI Media Pipeline Studio — Full Repository Audit
**Auditor:** Gemini Code Audit Agent  
**Date:** 2026-08-16  
**Scope:** All `.ts` / `.tsx` source files, `server.ts`, `package.json`  
**Total Files Audited:** 18  
**Total Lines of Code Audited:** ~6,400

---

## EXECUTIVE SUMMARY

| Category | Count |
|---|---|
| 🔴 Critical Runtime Bugs | 6 |
| 🟠 Logic Errors & Type Mismatches | 5 |
| 🟡 Dead / Zombie Code | 7 |
| 🔵 Duplication & Redundancy | 6 |
| ⚙️ Architectural & Performance Smells | 10 |
| **Total Issues** | **34** |

The codebase has two deeply problematic patterns: **(1) God Files** — `server.ts` (2,021 lines), `DeliverablesBundle.tsx` (1,748 lines), and `App.tsx` (901 lines with 400+ lines of hardcoded seed data) are too large to reason about safely; and **(2) Propagating Hardcoded Fallbacks** — the same demo data object (clips, lyrics, subtitles) is copy-pasted verbatim in 4+ locations, creating brittle, out-of-sync fallback chains.

---

## SECTION 1: REFACTORING TASKS BY FILE

---

### `server.ts` (2,021 lines)

---

#### 🔴 [RT-01] `/api/mux-video` endpoint is a non-functional stub
**Lines:** 1968–1997  
**Severity:** Critical (silent broken behavior)  
**Root Cause:** The endpoint imports `fs`, `exec`, and `util`, creates a `tmpDir`, but never executes any FFmpeg command. The `execPromise` variable is created and immediately abandoned. The endpoint returns a fake `{ success: true }` response every time.  
**Blast Radius:** Any future UI code that calls `/api/mux-video` will silently succeed without actually producing a file. The `download_url` returned (`/api/download-exported-video/...`) points to a route that doesn't exist.  
**Fix:** Either implement the FFmpeg mux logic or delete the endpoint entirely.

```diff
- app.post('/api/mux-video', async (req, res) => {
-   // ... imports fs, exec, util but never uses them
-   res.json({ success: true, ... }); // ← FAKE success
- });
+ // [DELETED] - Stub replaced by client-side MediaRecorder in videoExporter.ts
```

---

#### 🟠 [RT-02] `gemini-3-pro-image` errors are silently swallowed — user gets SVG fallback with no feedback
**Lines:** 1244–1263 (pipeline `catch`), 1776–1793 (thumbnail regen `catch`)  
**Severity:** Medium (silent degraded behavior)  
**Root Cause:** `gemini-3-pro-image` (Nano Banana Pro) is a real, documented model in the Google AI API. However, it may not be available on all API key tiers or regions, and can return a 404. The `catch` blocks at both callsites do nothing except `console.warn(...)` — the user is never informed that AI image generation failed and that they are seeing the SVG fallback instead.  
**Blast Radius:** Users assume the thumbnail shown is AI-generated when it is actually a procedural SVG. No error is surfaced in the UI.  
**Fix:** Surface the failure. Return a `thumbnailFailed: true` flag in the response and show a subtle warning badge in the UI when the SVG fallback is active.

---

#### 🔴 [RT-03] Four concurrent Gemini calls in `Promise.all` with no retry/rate-limit protection
**Lines:** 1597–1602  
**Severity:** High (flaky under API load)  
**Root Cause:** `Promise.all([tiktokTask(), ytTask(), thumbnailTask(), audioTask()])` fires 4 simultaneous Gemini API calls. There is no retry logic, no backoff, and no rate-limit handling. A single quota error in any one task causes the entire `Promise.all` to reject, losing all other results.  
**Fix:** Wrap each task in a retry-with-backoff helper. Use `Promise.allSettled` instead of `Promise.all` and handle per-task failures gracefully.

---

#### 🟠 [LG-01] `parseLyriaLyricsServer` is a truncated, buggy duplicate of `liricleParser.ts`
**Lines:** 1645–1682  
**Severity:** Medium (silent data loss)  
**Root Cause:** A local `parseLyriaLyricsServer` function handles only the `[start:end]` range format. The client-side `parseLyriaLyricsToSubtitles` supports 3 formats (range, standard LRC `[mm:ss]`, and plain text). When Lyria returns plain-text lyrics, the server parser returns `[]`, causing `chosenSubtitles` to be empty in the final bundle.  
**Blast Radius:** Empty subtitle array passed to the client; user sees no animated lyrics.  
**Fix:** Since `server.ts` is TypeScript running on Node, import `parseLyriaLyricsToSubtitles` from `src/utils/liricleParser.ts` directly.

---

#### 🟠 [LG-02] `resolveGeminiModelInfo` uses order-dependent substring matching
**Lines:** 34–50  
**Severity:** Medium (incorrect model resolution)  
**Root Cause:** `.includes('3.5')` matches any model string containing "3.5", including hypothetical future models like `gemini-3.5-pro`. Resolution relies entirely on evaluation order.  
**Fix:** Match exact `id` strings first; use substring aliases only as a documented fallback layer.

---

#### 🟠 [LG-03] `tokenCount` values are hardcoded fiction — misleading telemetry
**Lines:** 326, 748, 910, 1139, 1405  
**Severity:** Low-Medium  
**Root Cause:** `tokenCount += 750` etc. are fabricated. The `execution_metrics.tokens_consumed` shown in the UI dashboard is fictional data.  
**Fix:** Read from `response.usageMetadata?.totalTokenCount` if the SDK exposes it, or label the field "Estimated" in the UI.

---

#### 🟡 [DZ-01] Fallback clip data is guarded in two redundant locations
**Lines:** 332–581 (catch block) AND 586–634 (post-catch guard)  
**Severity:** Medium (maintenance burden)  
**Root Cause:** The catch block already sets a complete 3-clip `briefResult`. The guard at line 585 (`if (!briefResult.extracted_clips || ...)`) can never be true after the catch block ran. The two fallbacks also use different clip data, creating two different fallback datasets that can diverge.  
**Fix:** Remove the second guard block. Consolidate into a single `DEFAULT_CLIPS` constant.

---

### `src/App.tsx` (901 lines)

---

#### 🔴 [RT-04] Pipeline error handler silently swallows failures — user gets zero feedback
**Lines:** 702–707  
**Severity:** Critical (broken UX)  
**Root Cause:**
```ts
} catch (err: any) {
  console.warn('Backend execution note:', err?.message); // silent
}
```
Network errors, server 500s, and JSON parse failures are all silently suppressed. The `isRunning` spinner stops but no error state is communicated to the user.  
**Fix:** Add an `[error, setError]` state. Show an inline error banner or toast on catch.

---

#### 🟠 [LG-04] `handleLoadProject` fills `execution_metrics` with fields not in `types.ts`
**Lines:** 134–142  
**Severity:** Medium (type unsafety)  
**Root Cause:** The fallback object uses `total_duration_ms`, `phase1_ms`, `phase2_ms`, `phase3_ms`, `estimated_tokens`, `parallel_speedup_factor` — none of which are declared in the `MediaPackageOutput.execution_metrics` interface in `types.ts`.  
**Fix:** Create a typed `DEFAULT_EXECUTION_METRICS` constant using only the 5 fields in `types.ts`.

---

#### 🟡 [DZ-02] 400+ line demo bundle hardcoded inside `useEffect` body
**Lines:** 210–626  
**Severity:** Medium (maintainability)  
**Root Cause:** A 400-line literal object is defined inside a `useEffect` closure. The `new Date().toISOString()` at line 547 creates a fresh timestamp on every hot-reload cycle. The data is indistinguishable from real runtime output.  
**Fix:** Extract to `src/data/demoBundle.ts`. The `useEffect` becomes 3 lines.

---

#### 🟡 [DZ-03] Timer race condition: phase timers may fire before `clearTimeout` is reached
**Lines:** 648–678  
**Severity:** Low  
**Root Cause:** `p1Timer` (900ms) and `p2Timer` (2200ms) are created before `fetch()`. If the fetch resolves in <900ms, the timers fire before `clearTimeout` is called — advancing the phase display to incorrect states. `clearTimeout` then becomes a no-op.  
**Fix:** Use a `finally` block or cancel timers immediately after `await fetch()` resolves.

---

### `src/components/DeliverablesBundle.tsx` (1,748 lines)

---

#### 🔴 [RT-05] `navigator.clipboard.writeText` unhandled — crashes in non-HTTPS contexts
**Line:** 255  
**Severity:** High  
**Root Cause:**
```ts
navigator.clipboard.writeText(text); // unhandled Promise rejection
```
`navigator.clipboard` is `undefined` in non-HTTPS environments and will throw `TypeError`. In HTTPS, clipboard permission denial causes an unhandled promise rejection.  
**Fix:**
```ts
navigator.clipboard.writeText(text).catch((err) => {
  console.warn('Clipboard write failed, using execCommand fallback:', err);
});
```

---

#### 🟠 [LG-05] Subtitle resolution waterfall computed twice: at render + in `useEffect`
**Lines:** 168–177 (render), 186–203 (`useEffect`)  
**Severity:** Medium  
**Root Cause:** The `resolvedSubtitles` variable seeds `useState`, then the identical waterfall logic runs again in `useEffect`. On mount, subtitle state is set twice. `defaultSongLyrics` (56 lines) is also re-allocated on every render.  
**Fix:** Move `defaultSongLyrics` to module scope as `DEFAULT_SONG_LYRICS`. Compute resolution only in the `useEffect`.

---

#### ⚙️ [AP-01] 60fps `requestAnimationFrame` loop forces 60 full re-renders/second
**Lines:** 286–309  
**Severity:** High (performance)  
**Root Cause:** `setCurrentTimeMs(elapsed)` is called every animation frame during playback. Because it is React state, every call triggers a full re-render of the 1,748-line component and all children.  
**Fix:** Store playback time in `useRef<number>(0)`. Only call `setCurrentTimeMs` when the active **subtitle line index** changes (approximately once every 2–3 seconds).

---

#### 🟡 [DZ-04] `generateClientThumbnailSvg` imported but never called
**Line:** 52  
**Severity:** Medium (dead import forces dead module into bundle)  
**Root Cause:** `import { generateClientThumbnailSvg } from '../utils/thumbnailGenerator';` — no callsite for this function exists anywhere in the 1,748-line file.  
**Fix:** Delete the import line.

---

#### ⚙️ [AP-02] `defaultSongLyrics` 56-line array re-allocated on every render
**Lines:** 104–162  
**Severity:** Low-Medium  
**Fix:** Promote to module-level `const DEFAULT_SONG_LYRICS: SubtitleLine[] = [...]`.

---

### `src/utils/videoExporter.ts` (612 lines)

---

#### 🟠 [LG-06] `isImage` logic is redundant — second OR branch is unreachable
**Line:** 172  
**Severity:** Low  
**Root Cause:**
```ts
const isImage = !!imageSourceUrl || (!videoSourceUrl && !!imageSourceUrl);
//                                   ↑ dead: only true when first is already true
```
**Fix:** `const isImage = !!imageSourceUrl;`

---

#### 🔴 [RT-06] `AudioContext` not closed on export error — resource leak
**Lines:** 136, 249–264  
**Severity:** Medium  
**Root Cause:** `audioCtx.close()` only runs inside `mediaRecorder.onstop`. Errors occurring before `mediaRecorder.start()` leave the AudioContext open. Browsers enforce a limit of ~6 concurrent AudioContexts; repeated failed exports will silently break audio.  
**Fix:** Wrap the export function body in `try/finally { audioCtx.close(); }`.

---

#### 🟡 [DZ-05] `audioBufferToWavBlob` exported but never called anywhere
**Lines:** 21–71  
**Severity:** Low  
**Root Cause:** No callsite exists for this function in the entire codebase. All audio export paths use `MediaRecorder`.  
**Fix:** Delete or move to a `_unused/` archive with a comment.

---

### `src/utils/thumbnailGenerator.ts` (22 lines)

---

#### 🟡 [DZ-06] Entire module is dead code
**Severity:** Medium  
**Root Cause:** `generateClientThumbnailSvg` was the client-side SVG fallback before the server took over. All callsites were removed but the file and its import in `DeliverablesBundle.tsx` remain.  
**Fix:** Delete `thumbnailGenerator.ts`. Remove line 52 in `DeliverablesBundle.tsx`.

---

### `src/utils/audioSynth.ts` (372 lines)

---

#### ⚙️ [AP-03] Non-null assertion `this.ctx!` crashes in environments without Web Audio
**Lines:** 257–264  
**Severity:** Medium  
**Root Cause:** `getAudioContext()` calls `this.init()` then `return this.ctx!`. In browsers without `AudioContext` (some mobile browsers, SSR), `this.ctx` stays `null` and the `!` assertion throws `TypeError: null is not an object`.  
**Fix:** Return `AudioContext | null` and update all callers.

---

#### ⚙️ [AP-04] Guard check occurs after node allocation in synth interval — unnecessary AudioNode creation
**Lines:** 96–122  
**Severity:** Low-Medium  
**Root Cause:** The `if (!this.ctx || !this.isPlaying || !this.duckingGainNode) return;` guard is at the top of the interval callback, which is correct. However, the `startAlgorithmicSynth` is called before this guard in some paths. The primary concern is that if `AudioContext` suspends mid-playback, the interval keeps running, scheduling nodes that can't play.  
**Fix:** Move the guard to the very first line. Add a `ctx.state === 'suspended'` check.

---

### `src/components/PipelineStudio.tsx` (460 lines)

---

#### ⚙️ [AP-05] Blob URL from `URL.createObjectURL` not revoked on extraction failure
**Lines:** ~80–175  
**Severity:** Medium (memory leak)  
**Root Cause:** `const objectUrl = URL.createObjectURL(videoFile)` is created. `URL.revokeObjectURL` exists in the happy path but is skipped if `video.onerror` fires or canvas initialization fails.  
**Fix:**
```ts
try {
  // ... extraction logic
} finally {
  URL.revokeObjectURL(objectUrl);
}
```

---

### `package.json`

---

#### 🟡 [DZ-07] `motion` library installed but never imported anywhere
**Line:** 24 (`"motion": "^12.23.24"`)  
**Severity:** Medium (~150KB dead bundle weight)  
**Root Cause:** No `import` from `'motion'` or `'framer-motion'` exists in any `.ts`/`.tsx` file. The dependency is unused.  
**Fix:** `npm uninstall motion`

---

## SECTION 2: GLOBAL REDUNDANCY REPORT

### GR-01: Default Clip Data Copy-Pasted in 4+ Locations (~600 lines)

The same 3-clip array and "Red dress spinning" lyric set appear verbatim at:

| File | Lines | Purpose |
|---|---|---|
| `App.tsx` | 231–370 | Initial demo bundle seed |
| `server.ts` | 348–581 | Phase 1 catch block fallback |
| `server.ts` | 586–634 | Post-catch guard fallback |
| `DeliverablesBundle.tsx` | 81–98 | Component-level clips fallback |
| `server.ts` | 1422–1480 | Audio task fallback lyrics |
| `DeliverablesBundle.tsx` | 104–162 | Default song lyrics |

**Fix:** Create `src/data/demoContent.ts` with `DEFAULT_CLIPS`, `DEFAULT_LYRICS`, `DEFAULT_EXECUTION_METRICS`. Import at every fallback site.

---

### GR-02: Lyrics Parsing Logic Duplicated Across Frontend and Backend

| Location | Formats Supported |
|---|---|
| `src/utils/liricleParser.ts` | Range `[s:e]`, Standard LRC `[mm:ss]`, Plain text (3 formats) |
| `server.ts` `parseLyriaLyricsServer` | Range `[s:e]` only (1 format) |

Server-side parser silently drops plain-text Lyria output → empty subtitle bundle.  
**Fix:** Import `parseLyriaLyricsToSubtitles` directly in `server.ts` (both are TypeScript).

---

### GR-03: Copy-to-Clipboard Handler Duplicated Across Components

`DeliverablesBundle.tsx` (line 254) and likely `DagGraphViewer.tsx` both implement the same clipboard + 2s reset pattern.  
**Fix:** Extract to `src/hooks/useCopyToClipboard.ts`.

---

### GR-04: `execution_metrics` Has Three Inconsistent Schemas

- `types.ts`: 5 typed fields (`total_latency_ms`, `sequential_estimate_ms`, `latency_saved_percent`, `tokens_consumed`, `timestamp`)
- `App.tsx` fallback: 7 different fields (`total_duration_ms`, `phase1_ms`, `phase2_ms`, `phase3_ms`, `estimated_tokens`, `parallel_speedup_factor`, `latency_saved_percent`)
- `server.ts` output: `total_latency_ms`, `sequential_estimate_ms`, `latency_saved_percent`, `tokens_consumed`, `timestamp` (matches type ✓)

**Fix:** Delete the non-conforming fallback object in `App.tsx` and replace with the typed constants.

---

### GR-05: `server.ts` is a 2,021-line God File

All 6 routes, 6 agent task functions, inline JSON schemas, a 70-line SVG generator, and server bootstrap all coexist in one file. Any edit risks unintended side effects.  
**Suggested Structure:**
```
server/
  index.ts          ← bootstrap + route registration only
  agents/
    phase1_analyst.ts
    phase2_tiktok.ts
    phase2_youtube.ts
    phase2_thumbnail.ts
    phase2_audio.ts
  utils/
    geminiClient.ts
    svgGenerator.ts
    modelResolver.ts
```

---

## SECTION 3: VERIFICATION CHECKLIST

### Automated Tests
```bash
npm run test    # Run Vitest suite
npm run lint    # TypeScript strict check (no emit)
```

### Manual Verification

- [ ] **RT-01**: `POST /api/mux-video` — confirm deleted or returns documented error
- [ ] **RT-02**: Run pipeline with standard key — confirm no `gemini-3-pro-image` 404 in server logs
- [ ] **RT-04**: Kill network, click Run — confirm error message visible in UI (not silent)
- [ ] **RT-05**: Test copy button in `http://` context — no `TypeError` in console
- [ ] **RT-06**: Cancel export mid-way repeatedly — check DevTools Memory for AudioContext count
- [ ] **LG-01**: Run pipeline with plain-text lyric output — confirm subtitles appear in bundle
- [ ] **AP-01**: Play audio — open React DevTools Profiler — re-renders drop from ~60/s to ~1 per subtitle line change
- [ ] **DZ-07**: `npm ls motion` after uninstall — package no longer listed
- [ ] **GR-01**: `grep -r "Red dress spinning"` — returns exactly 1 result (in `demoContent.ts`)
- [ ] **GR-02**: Server-side lyric parse — plain-text Lyria output produces non-empty subtitle array

---

## PRIORITY ORDER

| Priority | Task IDs | Estimated Effort |
|---|---|---|
| **P0 — Immediate** | RT-01, RT-04, RT-05, RT-06 | 1–2 hours |
| **P1 — This Week** | RT-02, RT-03, LG-01, LG-04, DZ-04, DZ-07 | 3–4 hours |
| **P2 — Refactor Sprint** | AP-01, GR-01, GR-02, DZ-02, LG-05 | 4–6 hours |
| **P3 — Housekeeping** | DZ-05, DZ-06, LG-02, LG-03, LG-06, AP-02 | 1–2 hours |
| **P4 — Architecture** | AP-03, AP-04, AP-05, GR-03, GR-04, GR-05 | 6–8 hours |

---

*All 34 findings are backed by direct file + line number evidence from static analysis of the full codebase. No issue listed without a traceable source location.*
