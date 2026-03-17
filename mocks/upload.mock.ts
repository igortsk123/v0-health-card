// mocks/upload.mock.ts
// Realistic mock for uploadService.
// Simulates ~800ms network delay.
// TODO: remove when real /api/upload endpoint is ready.

import type { UploadFileResponse } from '@/types/upload.types'
import { ok } from '@/types/api.types'
import type { ApiResponse } from '@/types/api.types'

const MOCK_UPLOAD_RESPONSE: UploadFileResponse = {
  uploadId: 'upload_mock_001',
  fileName: 'анализы_крови_март_2024.pdf',
  fileSize: 284112,
  mimeType: 'application/pdf',
  createdAt: '2024-03-15T09:42:00.000Z',
}

export async function mockUploadFile(): Promise<ApiResponse<UploadFileResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return ok(MOCK_UPLOAD_RESPONSE)
}
