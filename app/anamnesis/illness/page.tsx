'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { StageHeader } from '@/components/shared/StageHeader'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { useSession } from '@/context/SessionContext'

// TODO: Workstream E — replace stub with full illness-anamnesis flow.

export default function IllnessAnamnesisPage() {
  const router = useRouter()
  const { session } = useSession()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (session.stage !== 'illness_anamnesis') {
      router.replace('/anamnesis/life')
      return
    }
    setHydrated(true)
  }, [session.stage, router])

  if (!hydrated) return null

  return (
    <AppShell>
      <main className="flex flex-col gap-6 px-4 py-10 sm:px-6 max-w-2xl mx-auto w-full">
        <ProgressBar step={5} totalSteps={7} />

        <StageHeader
          title="Анкета о заболеваниях"
          subtitle="Этот раздел будет доступен в следующем обновлении."
        />

        <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
          Workstream E — в разработке
        </div>

        <DisclaimerBlock />
      </main>
    </AppShell>
  )
}
