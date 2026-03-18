# api-contracts.md
# HealthCard — "Второе мнение"
# API Contracts — Workstream B (Free Flow)
_Last updated: Workstream B — Free Flow_

All endpoints are stubbed via mock layer (`NEXT_PUBLIC_USE_MOCK=true`).
Real endpoints to be wired when backend is ready.

---

## POST /api/upload

**Purpose:** Upload a medical analysis document (image or PDF).

**Request:** `multipart/form-data`
```
file: File  (JPEG | PNG | PDF, max 10 MB)
```

**Response `200`:**
```json
{
  "uploadId": "upload_abc123",
  "fileName": "анализы_крови_март_2024.pdf",
  "fileSize": 284112,
  "mimeType": "application/pdf",
  "createdAt": "2024-03-15T09:42:00.000Z"
}
```

**Error responses:**
- `400` — unsupported format or file too large
- `500` — internal server error

**TypeScript DTOs:** `UploadFileRequest`, `UploadFileResponse` in `types/upload.types.ts`
**Service:** `services/uploadService.ts → uploadFile()`
**Mock:** `mocks/upload.mock.ts → mockUploadFile()` — simulates 800ms delay

---

## GET /api/result/status?uploadId=:id

**Purpose:** Poll document parsing status. Called repeatedly until `status !== 'processing'`.

**Request query params:**
```
uploadId: string
```

**Response `200`:**
```json
{
  "sessionId": "session_xyz789",
  "status": "processing" | "done" | "failed"
}
```

**Polling strategy (client):**
- Interval: 3 000 ms
- Max attempts: 20 (~60 seconds total)
- On `done` → save `sessionId` to session, navigate to `/result/free`
- On `failed` → show `ErrorState`, offer retry to `/upload`
- On max attempts exceeded → show timeout `ErrorState`

**TypeScript DTOs:** `PollParsingRequest`, `PollParsingResponse` in `types/result.types.ts`
**Service:** `services/resultService.ts → pollParsing()`
**Mock:** `mocks/result.mock.ts → mockPollParsing()` — returns `status: "done"` after 2 000ms

---

## GET /api/result/free?uploadId=:id

**Purpose:** Fetch free-tier result: first `FREE_RESULT_MAX_MARKERS` (3) markers and metadata.

**Request query params:**
```
uploadId: string
```

**Response `200`:**
```json
{
  "totalMarkers": 7,
  "freeMarkers": [
    {
      "id": "hgb",
      "name": "Гемоглобин",
      "value": "185 г/л",
      "referenceRange": "120–160 г/л",
      "status": "elevated",
      "flagged": true,
      "note": "Значение выше референсного диапазона. Может быть связано с рядом состояний — стоит обсудить с врачом."
    }
  ],
  "lockedCount": 4,
  "hasRedFlags": true,
  "analyzedAt": "2024-03-15T09:43:30.000Z"
}
```

**`status` enum:** `"normal"` | `"elevated"` | `"low"` | `"critical"`

**Medical wording rules for `note` field:**
- Always informational: "может быть связано", "вероятный сценарий", "стоит обсудить с врачом"
- Never diagnostic: "у вас диагноз", "это подтверждает", "точная причина"

**TypeScript DTOs:** `GetFreeResultRequest`, `FreeResultResponse`, `ResultMarker` in `types/result.types.ts`
**Service:** `services/resultService.ts → getFreeResult()`
**Mock:** `mocks/result.mock.ts → mockGetFreeResult()` — returns 3 markers after 1 000ms

---

---

## POST /api/anamnesis/life/start

_Added: Workstream D — Life Anamnesis_

**Purpose:** Begin a life-anamnesis session. Returns the first question and initial progress.

**Request body (`application/json`):**
```json
{
  "sessionId": "session_xyz789"
}
```

**Response `200`:**
```json
{
  "question": {
    "id": "la_q0",
    "text": "Есть ли у вас хронические заболевания?",
    "hint": null,
    "input": { "type": "boolean" }
  },
  "progress": { "currentStep": 1, "estimatedTotal": 10 }
}
```

**`input.type` enum:** `"boolean"` | `"single"` | `"multi"` | `"text"` | `"number"`

**TypeScript DTOs:** `AnamnesisQuestion`, `AnamnesisProgressDTO`, `StartAnamnesisResponseDTO` in `types/anamnesis.types.ts`
**Service:** `services/anamnesisService.ts → startLifeAnamnesis()`
**Mock:** `mocks/anamnesis.mock.ts → mockStartLifeAnamnesis()` — 800ms delay, resets step index for session

---

## POST /api/anamnesis/life/answer

_Added: Workstream D — Life Anamnesis_

**Purpose:** Submit an answer to the current question. Returns the next question or null on completion.

**Request body (`application/json`):**
```json
{
  "sessionId": "session_xyz789",
  "questionId": "la_q0",
  "value": true
}
```

`value` type depends on `question.input.type`:
- `boolean` → `true | false`
- `single` → `string` (one of `options`)
- `multi` → `string[]` (subset of `options`)
- `text` → `string`
- `number` → `number`

**Response `200` — mid-flow:**
```json
{
  "question": { "id": "la_q1", "text": "Какие именно?", "input": { "type": "text" } },
  "progress": { "currentStep": 2, "estimatedTotal": 10 }
}
```

**Response `200` — final answer (`question === null`):**
```json
{
  "question": null,
  "progress": { "currentStep": 10, "estimatedTotal": 10 },
  "anamnesisId": "life_session_xyz789"
}
```

**Client behaviour on `question === null`:**
- Call `setSession({ lifeAnamnesisId, stage: 'illness_anamnesis' })`
- Navigate to `/anamnesis/illness`

**Error responses:**
- `400` — missing or invalid fields
- `404` — sessionId not found
- `500` — internal server error

**TypeScript DTOs:** `AnamnesisAnswer`, `AnswerAnamnesisResponseDTO` in `types/anamnesis.types.ts`
**Service:** `services/anamnesisService.ts → answerLifeQuestion()`
**Mock:** `mocks/anamnesis.mock.ts → mockAnswerLifeQuestion()` — 1000ms delay, 10-question sequence

---

---

## POST /api/anamnesis/illness/start

_Added: Workstream E — Illness Anamnesis_

**Purpose:** Begin an illness-anamnesis session after life-anamnesis is complete.

**Request body (`application/json`):**
```json
{
  "sessionId": "session_xyz789",
  "lifeAnamnesisId": "life_session_xyz789"
}
```

**Response `200`:**
```json
{
  "question": {
    "id": "ia_q0",
    "text": "Что вас беспокоит в первую очередь?",
    "hint": "Опишите главную жалобу как можно точнее.",
    "input": { "type": "text", "placeholder": "Например: боль в правом боку…" }
  },
  "progress": { "currentStep": 1, "estimatedTotal": 10 }
}
```

**TypeScript DTOs:** `StartAnamnesisResponseDTO` in `types/anamnesis.types.ts`
**Service:** `services/anamnesisService.ts → startIllnessAnamnesis()`
**Mock:** `mocks/anamnesis.mock.ts → mockStartIllnessAnamnesis()` — 800ms delay, resets step and answer cache

---

## POST /api/anamnesis/illness/answer

_Added: Workstream E — Illness Anamnesis_

**Purpose:** Submit an answer to the current illness-anamnesis question.

**Request body (`application/json`):**
```json
{
  "sessionId": "session_xyz789",
  "questionId": "ia_q0",
  "value": "боль в правом боку"
}
```

**Response `200` — mid-flow:** same shape as life-anamnesis answer (no `redFlag`).

**Response `200` — final answer (`question === null`):**
```json
{
  "question": null,
  "progress": { "currentStep": 10, "estimatedTotal": 10 },
  "illnessAnamnesisId": "ill_session_xyz789",
  "redFlag": {
    "flagged": true,
    "urgencyLevel": "watch",
    "reason": "Симптомы существенно влияют на повседневную жизнь"
  }
}
```

**`urgencyLevel` enum:** `"none"` | `"watch"` | `"urgent"`

**Client behaviour on `question === null`:**
- If `redFlag.flagged === true`: show `WarningBlock`, display "Продолжить" CTA
- After user confirms (or no red flag): call `setSession({ illnessAnamnesisId, stage: 'scenarios' })` and navigate to `/scenarios`

**TypeScript DTOs:** `IllnessAnswerResponseDTO`, `RedFlagDTO` in `types/anamnesis.types.ts`
**Service:** `services/anamnesisService.ts → answerIllnessQuestion()`
**Mock:** `mocks/anamnesis.mock.ts → mockAnswerIllnessQuestion()` — 1000ms delay, red-flag triggered when severity answer is 'Существенно'

---

## POST /api/payment/create

_Added: Workstream C — Payment Flow_

**Purpose:** Create a payment session for the premium analysis.

**Request body (`application/json`):**
```json
{
  "uploadId": "upload_abc123",
  "amount": 499
}
```

**Response `200`:**
```json
{
  "paymentId": "pay_xyz789",
  "uploadId": "upload_abc123",
  "amount": 499,
  "status": "pending",
  "createdAt": "2024-03-15T09:45:00.000Z"
}
```

**TypeScript DTOs:** `PaymentSessionDTO` in `types/payment.types.ts`
**Service:** `services/paymentService.ts → createPaymentSession()`
**Mock:** `mocks/payment.mock.ts → mockCreatePaymentSession()` — 800ms delay

---

## GET /api/payment/status?paymentId=:id

_Added: Workstream C — Payment Flow_

**Purpose:** Poll payment status. Called repeatedly until status is not 'processing'.

**Response `200`:**
```json
{
  "paymentId": "pay_xyz789",
  "status": "success",
  "updatedAt": "2024-03-15T09:46:30.000Z"
}
```

**`status` enum:** `"pending"` | `"processing"` | `"success"` | `"failed"` | `"expired"`

**Client behaviour:**
- Polling interval: 3000ms, timeout: 30s
- On `success` → `setSession({ stage: 'life_anamnesis' })` → navigate to `/payment/success`
- On `failed` / `expired` → show `ErrorState`

**TypeScript DTOs:** `PaymentStatusDTO` in `types/payment.types.ts`
**Service:** `services/paymentService.ts → pollPaymentStatus()`
**Mock:** `mocks/payment.mock.ts → mockPollPaymentStatus()` — returns 'success' after 2000ms

---

## POST /api/payment/confirm

_Added: Workstream C — Payment Flow_

**Purpose:** Confirm payment completion (called after polling resolves as 'success').

**Request body (`application/json`):**
```json
{ "paymentId": "pay_xyz789" }
```

**Response `200`:**
```json
{
  "paymentId": "pay_xyz789",
  "status": "success",
  "confirmedAt": "2024-03-15T09:46:35.000Z"
}
```

**TypeScript DTOs:** `PaymentConfirmDTO` in `types/payment.types.ts`
**Service:** `services/paymentService.ts → confirmPayment()`
**Mock:** `mocks/payment.mock.ts → mockConfirmPayment()` — 500ms delay

---

## POST /api/scenarios/generate

_Added: Workstream F — Scenario Generation_

**Purpose:** Trigger scenario generation based on session + illness anamnesis data.

**Request body (`application/json`):**
```json
{
  "sessionId": "session_xyz789",
  "illnessAnamnesisId": "ill_session_xyz789"
}
```

**Response `200`:**
```json
{
  "generationId": "gen_abc001",
  "status": "generating"
}
```

**TypeScript DTOs:** `GenerateScenariosRequest`, `GenerateScenariosResponse` in `types/scenario.types.ts`
**Service:** `services/scenarioService.ts → generateScenarios()`
**Mock:** `mocks/scenario.mock.ts → mockGenerateScenarios()` — 1500ms delay

---

## GET /api/scenarios/status?generationId=:id

_Added: Workstream F — Scenario Generation_

**Purpose:** Poll scenario generation status.

**Response `200`:**
```json
{
  "generationId": "gen_abc001",
  "status": "ready"
}
```

**`status` enum:** `"generating"` | `"ready"` | `"failed"`

**Polling strategy:** interval 3000ms, timeout 60s. On `ready` → call `GET /api/scenarios`.

**TypeScript DTOs:** `PollScenariosResponse` in `types/scenario.types.ts`
**Service:** `services/scenarioService.ts → pollScenarios()`
**Mock:** `mocks/scenario.mock.ts → mockPollScenarios()` — first call 'generating', second 'ready'

---

## GET /api/scenarios?generationId=:id

_Added: Workstream F — Scenario Generation_

**Purpose:** Fetch the completed scenario list.

**Response `200`:**
```json
{
  "generationId": "gen_abc001",
  "scenarios": [
    {
      "id": "scenario_anemia",
      "title": "Возможная железодефицитная анемия",
      "summary": "Выявленные изменения могут быть связаны с недостатком железа…",
      "relatedMarkers": ["Гемоглобин", "Эритроциты", "MCV"],
      "probability": "high"
    }
  ],
  "generatedAt": "2024-03-15T09:47:00.000Z"
}
```

**`probability` enum:** `"high"` | `"medium"` | `"low"`

**Medical wording rules for `summary`:**
- Always informational: "могут быть связаны", "вероятный сценарий", "стоит обсудить с врачом"
- Never diagnostic claims

**TypeScript DTOs:** `GetScenariosResponse`, `Scenario` in `types/scenario.types.ts`
**Service:** `services/scenarioService.ts → getScenarios()`
**Mock:** `mocks/scenario.mock.ts → mockGetScenarios()` — 800ms delay, 3 scenarios

---

## POST /api/roadmap/generate

_Added: Workstream G — Roadmap Generation_

**Purpose:** Trigger roadmap generation for a selected scenario.

**Request body (`application/json`):**
```json
{
  "sessionId": "session_xyz789",
  "scenarioId": "scenario_anemia"
}
```

**Response `200`:**
```json
{
  "roadmapId": "roadmap_001",
  "status": "generating"
}
```

**TypeScript DTOs:** `GenerateRoadmapRequest`, `GenerateRoadmapResponse` in `types/roadmap.types.ts`
**Service:** `services/roadmapService.ts → generateRoadmap()`
**Mock:** `mocks/roadmap.mock.ts → mockGenerateRoadmap()` — 1500ms delay

---

## GET /api/roadmap/status?roadmapId=:id

_Added: Workstream G — Roadmap Generation_

**Purpose:** Poll roadmap generation status.

**Response `200`:**
```json
{ "roadmapId": "roadmap_001", "status": "ready" }
```

**`status` enum:** `"generating"` | `"ready"` | `"failed"`

**Polling strategy:** interval 4000ms, timeout 60s. On `ready` → call `GET /api/roadmap`.

**TypeScript DTOs:** `PollRoadmapResponse` in `types/roadmap.types.ts`
**Service:** `services/roadmapService.ts → pollRoadmap()`
**Mock:** `mocks/roadmap.mock.ts → mockPollRoadmap()` — first call 'generating', second 'ready'

---

## GET /api/roadmap?roadmapId=:id

_Added: Workstream G — Roadmap Generation_

**Purpose:** Fetch the completed roadmap with all steps.

**Response `200`:**
```json
{
  "roadmapId": "roadmap_001",
  "scenarioId": "scenario_anemia",
  "scenarioTitle": "Возможная железодефицитная анемия",
  "summary": "На основании выявленных отклонений составлен информационный план…",
  "steps": [
    {
      "id": "step_ferritin",
      "category": "analysis",
      "title": "Анализ на ферритин и сывороточное железо",
      "description": "Позволяет оценить запасы железа…",
      "priority": "high",
      "timeframe": "в течение 1–2 недель"
    }
  ],
  "generatedAt": "2024-03-15T09:48:00.000Z",
  "pdfUrl": null
}
```

**`category` enum:** `"analysis"` | `"specialist"` | `"lifestyle"` | `"monitoring"` | `"questions"`
**`priority` enum:** `"high"` | `"normal"` | `"low"`

**TypeScript DTOs:** `RoadmapResponse`, `RoadmapStep` in `types/roadmap.types.ts`
**Service:** `services/roadmapService.ts → getRoadmap()`
**Mock:** `mocks/roadmap.mock.ts → mockGetRoadmap()` — 800ms delay, 6 steps across 5 categories

---

## GET /api/roadmap/pdf?roadmapId=:id

_Added: Workstream G — Roadmap Generation_

**Purpose:** Get PDF download URL for the roadmap. Returns `'#'` stub until PDF generation is implemented.

**Response `200`:**
```json
{ "pdfUrl": "https://cdn.example.com/roadmaps/roadmap_001.pdf" }
```

**TypeScript DTOs:** `GetRoadmapPdfResponse` in `types/roadmap.types.ts`
**Service:** `services/roadmapService.ts → getRoadmapPdf()`
**Mock:** `mocks/roadmap.mock.ts → mockGetRoadmapPdf()` — 500ms delay, returns `'#'`

---

## Error envelope (all endpoints)

All errors return the `ApiResponse<T>` shape with `data: null`:

```json
{
  "data": null,
  "error": "Описание ошибки на русском языке",
  "status": 500
}
```

Handled via `fail<T>(message, status)` utility in `types/api.types.ts`.
