# HANDOFF.md
# HealthCard — "Второе мнение"
# Frontend Handoff Document — Workstream H (Integration QA)

_Created: Workstream H. All workstreams A–G are complete. Frontend is production-ready pending backend integration._

---

## Session Flow (Complete Funnel)

```
/                       (landing)
  ↓ upload CTA
/upload                 stage: idle → upload
  ↓ file submitted
/upload/parsing         stage: parsing  (polls /api/result/status)
  ↓ done
/result/free            stage: free_result  (writes on data load)
  ↓ "Узнать больше" CTA
/offer                  stage: offer  (writes on arrival)
  ↓ payment CTA
/payment/processing     stage: payment  (polls /api/payment/status)
  ↓ success
/payment/success        stage: life_anamnesis
  ↓ "Начать анкету" CTA
/anamnesis/life         stage: life_anamnesis  (10-question adaptive flow)
  ↓ completion → stage: illness_anamnesis
/anamnesis/illness      stage: illness_anamnesis  (10-question flow + red-flag check)
  ↓ completion → stage: scenarios
/scenarios              stage: scenarios  (generate + poll + show list)
  ↓ card click
/scenarios/[id]         stage: scenarios  (detail + confirm)
  ↓ confirm → stage: scenario_selected
/roadmap                stage: roadmap_ready after generation  (generate + poll + show)
  ↓ "Скачать PDF" or view
/roadmap/ready          stage: roadmap_ready  (PDF download stub)
```

All stage transitions are written via `setSession()` from `SessionContext`.
`SessionStage` type is the single source of truth — see `types/session.types.ts`.

---

## Session Fields Reference

| Field | Type | Set by | Used by |
|---|---|---|---|
| `sessionId` | `string \| null` | `/upload/parsing` on done | anamnesis, scenarios, roadmap services |
| `stage` | `SessionStage` | each page on arrival/completion | all route guards |
| `uploadId` | `string \| null` | `/upload` on file submit | `/result/free`, `/offer` |
| `paymentId` | `string \| null` | `/offer` on payment session create | `/payment/processing` |
| `lifeAnamnesisId` | `string \| null` | `/anamnesis/life` on completion | `/anamnesis/illness` start call |
| `illnessAnamnesisId` | `string \| null` | `/anamnesis/illness` on completion | `/scenarios` generate call |
| `selectedScenarioId` | `string \| null` | `/scenarios/[id]` on confirm | `/roadmap` generate call |
| `roadmapId` | `string \| null` | `/roadmap` on generation ready | `/roadmap/ready` PDF download |

---

## Mock Inventory

All mocks live in `/mocks/`. Toggle with `NEXT_PUBLIC_USE_MOCK=true`.

| Mock file | Endpoints covered | Delay |
|---|---|---|
| `upload.mock.ts` | `POST /api/upload` | 800ms |
| `result.mock.ts` | `GET /api/result/status`, `GET /api/result/free` | 2000ms, 1000ms |
| `payment.mock.ts` | `POST /api/payment/create`, `GET /api/payment/status`, `POST /api/payment/confirm` | 800ms, 2000ms (→ success), 500ms |
| `anamnesis.mock.ts` | Life: start + 10 answers. Illness: start + 10 answers + red-flag logic | 800ms start, 1000ms per answer |
| `scenario.mock.ts` | generate (→ 'generating'), poll (→ 'ready' on 2nd call), get (3 scenarios) | 1500ms, 2000ms, 800ms |
| `roadmap.mock.ts` | generate (→ 'generating'), poll (→ 'ready' on 2nd call), get (6-step roadmap), pdf stub | 1500ms, 2000ms, 800ms, 500ms |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_USE_MOCK` | Dev only | Set to `"true"` to use all mock services instead of real API |

No other env vars are needed for the frontend until backend endpoints are wired.

---

## Backend Integration Checklist

When the backend is ready, replace each mock with a real API call by:
1. Setting `NEXT_PUBLIC_USE_MOCK=false` (or removing the env var)
2. Implementing the endpoint on the server matching the contract in `docs/api-contracts.md`
3. Verifying the TypeScript DTOs in `types/` match the real response shapes

Priority order for wiring:
1. `POST /api/upload` + `GET /api/result/status` + `GET /api/result/free` (core free flow)
2. `POST /api/payment/create` + `GET /api/payment/status` (payment)
3. `POST /api/anamnesis/life/start` + `/answer` + illness equivalents (anamnesis)
4. `POST /api/scenarios/generate` + poll + get (scenarios)
5. `POST /api/roadmap/generate` + poll + get + pdf (roadmap)

---

## Known Limitations / TODOs

- **PDF generation** (`/roadmap/ready`): `pdfUrl` is `null` in the mock. `RoadmapActions` shows a toast instead of downloading. Wire `GET /api/roadmap/pdf?roadmapId=...` when ready.
- **Session persistence**: Session is stored in `localStorage` only. No server-side session yet. Add server-side persistence when auth is implemented.
- **`/scenarios/[id]` scenario lookup**: The detail page fetches the full scenario list and filters by id. Replace with `GET /api/scenarios/:id` when the backend exposes it.
- **`MOCK_GENERATION_ID`** constant in `/scenarios/[id]/page.tsx`: Hard-coded to `'gen_mock_001'` for mock compatibility. Remove when backend is wired — the real `generationId` should be stored in session.
- **`/payment/error`**: Route listed in `PROJECT_STRUCTURE.md` but not visited by the current flow (failed payment shows `ErrorState` on `/payment/processing`). Implement as a dedicated page if needed.
- **Auth**: No authentication in the current frontend. All session data is anonymous and client-only.

---

## Rules for Future Contributors

See `docs/PROJECT_STRUCTURE.md` §Rules for Contributors for the full list.
Key rules:
1. Every screen: loading, empty, success, error states.
2. Every API call goes through `services/` — never raw `fetch` in components.
3. `DisclaimerBlock` required on every screen with medical content.
4. Never use diagnostic wording. See `lib/constants.ts` for approved phrasing.
5. Keep files under ~100 lines. Split if needed; update `PROJECT_STRUCTURE.md`.
