import Link from 'next/link'
import { AppShell } from '@/components/shared/AppShell'
import { CtaGroup } from '@/components/shared/CtaGroup'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { PRODUCT_NAME, PRODUCT_TAGLINE, DISCLAIMER_SHORT } from '@/lib/constants'

export default function LandingPage() {
  return (
    <AppShell>
      <main className="flex flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16 max-w-2xl mx-auto w-full">
        {/* Hero */}
        <section className="flex flex-col gap-4">
          <span className="text-sm font-medium text-primary uppercase tracking-widest">
            Медицинская информационная поддержка
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-balance text-foreground">
            {PRODUCT_NAME}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground text-pretty">
            {PRODUCT_TAGLINE}
          </p>
        </section>

        {/* How it works */}
        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-foreground">Как это работает</h2>
          <ol className="flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">{step.title}</span>
                  <span className="text-sm text-muted-foreground leading-relaxed">{step.desc}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <CtaGroup
          primary={{ label: 'Загрузить анализы', href: '/upload' }}
          secondary={{ label: 'Узнать подробнее', href: '#how-it-works' }}
        />

        <DisclaimerBlock text={DISCLAIMER_SHORT} />
      </main>
    </AppShell>
  )
}

const STEPS = [
  {
    title: 'Загрузите анализы',
    desc: 'Фотография или PDF с результатами лабораторных исследований.',
  },
  {
    title: 'Получите краткую расшифровку',
    desc: 'Сервис выделит показатели, на которые стоит обратить внимание.',
  },
  {
    title: 'Изучите вероятные сценарии',
    desc: 'Информационные гипотезы — что может быть связано с отклонениями.',
  },
  {
    title: 'Получите дорожную карту',
    desc: 'Список вопросов и тем для обсуждения с лечащим врачом.',
  },
]
