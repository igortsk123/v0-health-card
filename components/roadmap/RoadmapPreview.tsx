// components/roadmap/RoadmapPreview.tsx
// Displays the full roadmap: scenario title, summary, and all steps grouped by category.

import {
  FlaskConicalIcon,
  UserRoundIcon,
  SaladIcon,
  ActivityIcon,
  MessageCircleQuestionIcon,
  ArrowRightIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RoadmapResponse, RoadmapStep, RoadmapStepCategory } from '@/types/roadmap.types'

// ─── Category metadata ────────────────────────────────────────────────────────

interface CategoryMeta {
  label: string
  Icon: React.ElementType
  colorClass: string
  bgClass: string
}

const CATEGORY_META: Record<RoadmapStepCategory, CategoryMeta> = {
  analysis: {
    label: 'Дополнительные анализы',
    Icon: FlaskConicalIcon,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
  specialist: {
    label: 'Консультации специалистов',
    Icon: UserRoundIcon,
    colorClass: 'text-accent-foreground',
    bgClass: 'bg-accent',
  },
  lifestyle: {
    label: 'Образ жизни',
    Icon: SaladIcon,
    colorClass: 'text-chart-2',
    bgClass: 'bg-chart-2/10',
  },
  monitoring: {
    label: 'Наблюдение и контроль',
    Icon: ActivityIcon,
    colorClass: 'text-chart-3',
    bgClass: 'bg-chart-3/10',
  },
  questions: {
    label: 'Вопросы для врача',
    Icon: MessageCircleQuestionIcon,
    colorClass: 'text-warning',
    bgClass: 'bg-warning-bg',
  },
}

const CATEGORY_ORDER: RoadmapStepCategory[] = [
  'analysis',
  'specialist',
  'lifestyle',
  'monitoring',
  'questions',
]

// ─── Priority badge ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: RoadmapStep['priority'] }) {
  if (priority !== 'high') return null
  return (
    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
      Важно
    </span>
  )
}

// ─── Individual step card ─────────────────────────────────────────────────────

function StepCard({ step }: { step: RoadmapStep }) {
  const meta = CATEGORY_META[step.category]
  return (
    <li className="flex gap-3">
      <div className={cn('mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full', meta.bgClass)}>
        <ArrowRightIcon className={cn('h-3.5 w-3.5', meta.colorClass)} aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground leading-snug">{step.title}</span>
          <PriorityBadge priority={step.priority} />
        </div>
        {step.timeframe && (
          <span className="text-xs text-muted-foreground">{step.timeframe}</span>
        )}
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {step.description}
        </p>
      </div>
    </li>
  )
}

// ─── Category group ───────────────────────────────────────────────────────────

function CategoryGroup({ category, steps }: { category: RoadmapStepCategory; steps: RoadmapStep[] }) {
  const meta = CATEGORY_META[category]
  const { Icon } = meta

  return (
    <section aria-labelledby={`category-${category}`} className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-full', meta.bgClass)}>
          <Icon className={cn('h-3.5 w-3.5', meta.colorClass)} aria-hidden="true" />
        </div>
        <h3 id={`category-${category}`} className="text-sm font-semibold text-foreground">
          {meta.label}
        </h3>
      </div>
      <ul className="flex flex-col gap-4 pl-2">
        {steps.map((step) => (
          <StepCard key={step.id} step={step} />
        ))}
      </ul>
    </section>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface RoadmapPreviewProps {
  roadmap: RoadmapResponse
  className?: string
}

export function RoadmapPreview({ roadmap, className }: RoadmapPreviewProps) {
  // Group steps by category in display order
  const grouped = CATEGORY_ORDER.reduce<Record<string, RoadmapStep[]>>((acc, cat) => {
    const catSteps = roadmap.steps.filter((s) => s.category === cat)
    if (catSteps.length > 0) acc[cat] = catSteps
    return acc
  }, {})

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Scenario header */}
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Маршрутная карта
        </p>
        <h2 className="text-lg font-bold text-foreground text-balance leading-tight">
          {roadmap.scenarioTitle}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          {roadmap.summary}
        </p>
      </div>

      {/* Step groups */}
      <div className="flex flex-col gap-6">
        {(Object.keys(grouped) as RoadmapStepCategory[]).map((cat) => (
          <CategoryGroup key={cat} category={cat} steps={grouped[cat]} />
        ))}
      </div>
    </div>
  )
}
