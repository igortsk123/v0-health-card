import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CtaItem {
  label: string
  href?: string
  onClick?: () => void
  disabled?: boolean
}

interface CtaGroupProps {
  primary: CtaItem
  secondary?: CtaItem
  className?: string
  stacked?: boolean
}

/**
 * Primary + optional secondary CTA button group.
 * Used at the bottom of every funnel step.
 */
export function CtaGroup({ primary, secondary, className, stacked = false }: CtaGroupProps) {
  return (
    <div
      className={cn(
        'flex gap-3',
        stacked ? 'flex-col' : 'flex-col sm:flex-row',
        className,
      )}
    >
      {primary.href ? (
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={primary.href}>{primary.label}</Link>
        </Button>
      ) : (
        <Button
          size="lg"
          onClick={primary.onClick}
          disabled={primary.disabled}
          className="w-full sm:w-auto"
        >
          {primary.label}
        </Button>
      )}

      {secondary && (
        secondary.href ? (
          <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
            <Link href={secondary.href}>{secondary.label}</Link>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="lg"
            onClick={secondary.onClick}
            disabled={secondary.disabled}
            className="w-full sm:w-auto"
          >
            {secondary.label}
          </Button>
        )
      )}
    </div>
  )
}
