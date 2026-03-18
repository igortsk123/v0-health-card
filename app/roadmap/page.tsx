'use client'

// app/roadmap/page.tsx
// Workstream G stub — PDF roadmap generation.
// TODO: Workstream G — implement full roadmap generation and PDF export flow.

import { AppShell } from '@/components/shared/AppShell'
import { LoadingState } from '@/components/shared/LoadingState'

export default function RoadmapPage() {
  return (
    <AppShell>
      <main className="flex flex-col flex-1 items-center justify-center px-4 py-10 max-w-2xl mx-auto w-full">
        <LoadingState message="Формируем маршрутную карту…" />
        {/* TODO: Workstream G — replace with roadmap generation and PDF export flow */}
      </main>
    </AppShell>
  )
}
