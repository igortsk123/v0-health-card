// types/upload.types.ts
// DTOs for file upload flow (Workstream B).
// TODO: sync with backend schema before wiring real endpoint.

export interface UploadFileRequest {
  file: File
}

export interface UploadFileResponse {
  uploadId: string
  fileName: string
  fileSize: number  // bytes
  mimeType: string
  createdAt: string // ISO 8601
}

export const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const

export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number]

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
