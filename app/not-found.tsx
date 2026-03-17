import Link from 'next/link'
import { AppShell } from '@/components/shared/AppShell'
import { CtaGroup } from '@/components/shared/CtaGroup'

export default function NotFound() {
  return (
    <AppShell>
      <main className="flex flex-col items-center justify-center gap-6 px-4 py-24 text-center max-w-md mx-auto w-full">
        <span className="text-5xl font-bold text-muted-foreground" aria-hidden="true">
          404
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold text-foreground">Страница не найдена</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Такой страницы не существует. Возможно, ссылка устарела или была изменена.
          </p>
        </div>
        <CtaGroup primary={{ label: 'На главную', href: '/' }} />
      </main>
    </AppShell>
  )
}
