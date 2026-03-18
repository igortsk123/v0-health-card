// mocks/payment.mock.ts
// Realistic mocks for paymentService.
// All async with 1500ms delay.
// mockGetPaymentStatus: call 1 → 'processing', call 2+ → 'success'
// TODO: remove when real payment API is ready.

import type {
  PaymentSessionDTO,
  PaymentStatusDTO,
  PaymentConfirmDTO,
} from '@/types/payment.types'
import { ok } from '@/types/api.types'
import type { ApiResponse } from '@/types/api.types'

const MOCK_DELAY_MS = 1500

const callCountMap = new Map<string, number>()

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
}

export async function mockCreatePaymentSession(
  uploadId: string,
  amount: number,
): Promise<ApiResponse<PaymentSessionDTO>> {
  await delay()
  const paymentId = `pay_mock_${Date.now()}`
  return ok<PaymentSessionDTO>({
    paymentId,
    uploadId,
    amount,
    status: 'pending',
    createdAt: new Date().toISOString(),
  })
}

export async function mockGetPaymentStatus(
  paymentId: string,
): Promise<ApiResponse<PaymentStatusDTO>> {
  await delay()
  const count = (callCountMap.get(paymentId) ?? 0) + 1
  callCountMap.set(paymentId, count)
  const status = count === 1 ? 'processing' : 'success'
  return ok<PaymentStatusDTO>({
    paymentId,
    status,
    updatedAt: new Date().toISOString(),
  })
}

export async function mockConfirmPayment(
  paymentId: string,
): Promise<ApiResponse<PaymentConfirmDTO>> {
  await delay()
  return ok<PaymentConfirmDTO>({
    paymentId,
    status: 'success',
    confirmedAt: new Date().toISOString(),
  })
}
