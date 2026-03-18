'use client'

// app/scenarios/page.tsx
// Workstream F stub — scenario generation and selection.
// TODO: Workstream F — implement full scenario generation flow.

import { AppShell } from '@/components/shared/AppShell'
import { LoadingState } from '@/components/shared/LoadingState'

export default function ScenariosPage() {
  return (
    <AppShell>
      <main className="flex flex-col flex-1 items-center justify-center px-4 py-10 max-w-2xl mx-auto w-full">
        <LoadingState message="Формируем сценарии…" />
        {/* TODO: Workstream F — replace with scenario generation and selection flow */}
      </main>
    </AppShell>
  )
}
