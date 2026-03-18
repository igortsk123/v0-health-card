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
