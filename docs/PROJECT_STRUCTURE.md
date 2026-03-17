# PROJECT_STRUCTURE.md
# HealthCard — "Второе мнение"
_Last updated: Workstream B — Free Flow_

---

## App Routes

| Route | File | Workstream | Status |
|---|---|---|---|
| `/` | `app/page.tsx` | A | Done |
| `/upload` | `app/upload/page.tsx` | B | Done |
| `/upload/parsing` | `app/upload/parsing/page.tsx` | B | Done |
| `/result/free` | `app/result/free/page.tsx` | B | Done |
| `/offer` | `app/offer/page.tsx` | C | Stub |
| `/payment/processing` | `app/payment/processing/page.tsx` | C | Pending |
| `/payment/success` | `app/payment/success/page.tsx` | C | Pending |
| `/payment/error` | `app/payment/error/page.tsx` | C | Pending |
| `/anamnesis/life` | `app/anamnesis/life/page.tsx` | D | Pending |
| `/anamnesis/illness` | `app/anamnesis/illness/page.tsx` | E | Pending |
| `/scenarios` | `app/scenarios/page.tsx` | F | Pending |
| `/scenarios/[id]` | `app/scenarios/[id]/page.tsx` | F | Pending |
| `/roadmap` | `app/roadmap/page.tsx` | G | Pending |
| `/roadmap/ready` | `app/roadmap/ready/page.tsx` | G | Pending |

---

## Shared Components (`components/shared/`)

| File | Purpose | Lines |
|---|---|---|
| `AppShell.tsx` | Outer page wrapper — header + content + footer | ~37 |
| `StageHeader.tsx` | Stage title + subtitle + step indicator | ~33 |
| `DisclaimerBlock.tsx` | Standard medical disclaimer (required on all medical screens) | ~32 |
| `WarningBlock.tsx` | Red-flag / urgency block — calm, non-alarmist | ~40 |
| `LoadingState.tsx` | Centered spinner + message | ~31 |
| `EmptyState.tsx` | Empty list state with optional action | ~36 |
| `ErrorState.tsx` | Error state + retry CTA | ~38 |
| `CtaGroup.tsx` | Primary + secondary CTA button group | ~67 |
| `ProgressBar.tsx` | Segmented step progress bar (N of M) | ~42 |

---

## Types (`types/`)

| File | Contents | Workstream |
|---|---|---|
| `api.types.ts` | `ApiResponse<T>`, `LoadState`, `ApiError`, `ok()`, `fail()` | A |
| `session.types.ts` | `Session`, `SessionStage`, `DEFAULT_SESSION` | A |
| `upload.types.ts` | Upload DTOs | B | Done |
| `result.types.ts` | Result / marker DTOs | B | Done |
| `payment.types.ts` | Payment DTOs | C (pending) |
| `anamnesis.types.ts` | Question/answer DTOs | D+E (pending) |
| `scenario.types.ts` | Scenario DTOs | F (pending) |
| `roadmap.types.ts` | Roadmap / PDF DTOs | G (pending) |

---

## Services (`services/`)

All services: accept typed request DTOs, return `ApiResponse<T>`.
Switch between mock and real API with `NEXT_PUBLIC_USE_MOCK=true`.

| File | Workstream | Status |
|---|---|---|
| `uploadService.ts` | B | Done |
| `resultService.ts` | B | Done |
| `paymentService.ts` | C | Pending |
| `anamnesisService.ts` | D+E | Pending |
| `scenarioService.ts` | F | Pending |
| `roadmapService.ts` | G | Pending |

---

## Mocks (`mocks/`)

Russian-language realistic payloads. Each mock simulates 500–1500ms async delay.

| File | Workstream | Status |
|---|---|---|
| `upload.mock.ts` | B | Done |
| `result.mock.ts` | B | Done |
| `payment.mock.ts` | C | Pending |
| `anamnesis.mock.ts` | D+E | Pending |
| `scenario.mock.ts` | F | Pending |
| `roadmap.mock.ts` | G | Pending |

---

## Upload Components (`components/upload/`)

Added in Workstream B.

| File | Purpose | Lines |
|---|---|---|
| `FileUploadZone.tsx` | Drag-and-drop + tap file input with client-side MIME/size validation | ~114 |
| `FilePreviewCard.tsx` | Selected file name, size, type badge + remove button | ~61 |

---

## Result Components (`components/result/`)

Added in Workstream B.

| File | Purpose | Lines |
|---|---|---|
| `ParsingProgress.tsx` | Animated waiting screen shown during polling | ~49 |
| `ResultSummaryBanner.tsx` | Summary card: total/free markers, analysis date | ~58 |
| `ResultMarkerCard.tsx` | Single marker: value, reference range, status badge, informational note | ~62 |
| `ResultMarkerList.tsx` | Renders list of `ResultMarkerCard`s or `EmptyState` | ~38 |
| `LockedMarkersTeaser.tsx` | Upsell block listing locked marker count + CTA to `/offer` | ~41 |

---

## API Contracts

Full endpoint specs in `docs/api-contracts.md`.

---

| File | Purpose |
|---|---|
| `utils.ts` | `cn()` class merge utility (shadcn standard) |
| `constants.ts` | App-wide constants: product name, disclaimers, config values |
| `session.ts` | localStorage read/write/clear helpers (SSR-safe) |

---

## Context (`context/`)

| File | Purpose |
|---|---|
| `SessionContext.tsx` | `SessionProvider` + `useSession()` hook |

---

## Rules for Contributors

1. One prompt = one focused task. No side-refactoring.
2. Every screen must have: `loading`, `empty`, `success`, `error` states.
3. Every API call goes through `services/` — never raw `fetch` in components.
4. `DisclaimerBlock` is required on every screen with medical content.
5. Never claim medical certainty. Use restrained wording only (see `lib/constants.ts`).
6. Keep files under ~100 lines. Split if needed; update this file.
7. Update this file when adding new files/routes/components.
8. Never delete or rename files without explicit confirmation.
