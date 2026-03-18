// services/paymentService.ts
// Payment API layer for Workstream C.
// Set NEXT_PUBLIC_USE_MOCK=true to use mock data.
// TODO: replace TODO blocks with real payment provider API when backend is ready.

import type { ApiResponse } from '@/types/api.types'
import { fail } from '@/types/api.types'
import type {
  PaymentSessionDTO,
  PaymentStatusDTO,
  PaymentConfirmDTO,
} from '@/types/payment.types'
import {
  mockCreatePaymentSession,
  mockGetPaymentStatus,
  mockConfirmPayment,
} from '@/mocks/payment.mock'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export async function createPaymentSession(
  uploadId: string,
  amount: number,
): Promise<ApiResponse<PaymentSessionDTO>> {
  if (USE_MOCK) {
    return mockCreatePaymentSession(uploadId, amount)
  }
  // TODO: replace with real POST /api/payment/session
  try {
    const res = await fetch('/api/payment/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId, amount }),
    })
    if (!res.ok) {
      return fail<PaymentSessionDTO>('Ошибка создания сессии оплаты', res.status)
    }
    const data = (await res.json()) as PaymentSessionDTO
    return { data, error: null, status: res.status }
  } catch {
    return fail<PaymentSessionDTO>('Не удалось связаться с сервером')
  }
}

export async function getPaymentStatus(
  paymentId: string,
): Promise<ApiResponse<PaymentStatusDTO>> {
  if (USE_MOCK) {
    return mockGetPaymentStatus(paymentId)
  }
  // TODO: replace with real GET /api/payment/status/:paymentId
  try {
    const res = await fetch(`/api/payment/status/${encodeURIComponent(paymentId)}`)
    if (!res.ok) {
      return fail<PaymentStatusDTO>('Ошибка получения статуса оплаты', res.status)
    }
    const data = (await res.json()) as PaymentStatusDTO
    return { data, error: null, status: res.status }
  } catch {
    return fail<PaymentStatusDTO>('Не удалось связаться с сервером')
  }
}

export async function confirmPayment(
  paymentId: string,
): Promise<ApiResponse<PaymentConfirmDTO>> {
  if (USE_MOCK) {
    return mockConfirmPayment(paymentId)
  }
  // TODO: replace with real POST /api/payment/confirm
  try {
    const res = await fetch('/api/payment/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId }),
    })
    if (!res.ok) {
      return fail<PaymentConfirmDTO>('Ошибка подтверждения оплаты', res.status)
    }
    const data = (await res.json()) as PaymentConfirmDTO
    return { data, error: null, status: res.status }
  } catch {
    return fail<PaymentConfirmDTO>('Не удалось связаться с сервером')
  }
}
