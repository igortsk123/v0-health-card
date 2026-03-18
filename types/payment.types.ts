// types/payment.types.ts
// Payment flow DTOs for Workstream C.
// TODO: align field names with real payment provider when backend is wired.

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'expired'

export interface PaymentSessionDTO {
  paymentId: string
  uploadId: string
  amount: number
  status: PaymentStatus
  createdAt: string
}

export interface PaymentStatusDTO {
  paymentId: string
  status: PaymentStatus
  updatedAt: string
}

export interface PaymentConfirmDTO {
  paymentId: string
  status: 'success' | 'failed'
  confirmedAt: string
}
