// components/result/LockedMarkersTeaser.tsx
// Upsell block shown when lockedCount > 0 on /result/free.
// Wording is informational only — does not claim what locked markers contain diagnostically.

import { LockIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface LockedMarkersTeaserProps {
  lockedCount: number
}

export function LockedMarkersTeaser({ lockedCount }: LockedMarkersTeaserProps) {
  if (lockedCount <= 0) return null

  return (
    <aside
      aria-label="Доступ к полному отчёту"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/30 px-5 py-5"
    >
      <div className="flex items-start gap-3">
        <LockIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-foreground">
            Ещё {lockedCount}{' '}
            {lockedCount === 1 ? 'показатель скрыт' : lockedCount < 5 ? 'показателя скрыты' : 'показателей скрыты'}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Полный отчёт содержит расшифровку всех показателей, вероятные сценарии
            и список вопросов для обсуждения с врачом.
          </p>
        </div>
      </div>

      <Button asChild size="lg" className="w-full">
        <Link href="/offer">Получить полный отчёт</Link>
      </Button>
    </aside>
  )
}
