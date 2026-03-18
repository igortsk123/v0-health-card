'use client'

import { useState, useId } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { AnamnesisQuestion } from '@/types/anamnesis.types'

interface QuestionCardProps {
  question: AnamnesisQuestion
  disabled?: boolean
  onAnswer: (value: string | string[] | boolean | number) => void
}

/**
 * Renders the active anamnesis question with the correct input control.
 *
 * - boolean  → two tappable Yes/No buttons (auto-submit on tap)
 * - single   → tappable option list (auto-submit on tap)
 * - multi    → checkbox option list + explicit "Далее" button
 * - text     → textarea + explicit "Далее" button
 * - number   → numeric input + explicit "Далее" button
 *
 * When `disabled` is true all controls are non-interactive (loading state).
 */
export function QuestionCard({ question, disabled = false, onAnswer }: QuestionCardProps) {
  const { text, hint, input } = question
  const inputId = useId()

  // Local state for controlled inputs
  const [textValue, setTextValue] = useState('')
  const [numberValue, setNumberValue] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  // Reset local state when question changes (key prop on page handles this,
  // but guard here too for safety)
  function handleSubmitText() {
    if (!textValue.trim()) return
    onAnswer(textValue.trim())
  }

  function handleSubmitNumber() {
    const parsed = parseFloat(numberValue)
    if (isNaN(parsed)) return
    onAnswer(parsed)
  }

  function handleSubmitMulti() {
    if (selectedOptions.length === 0) return
    onAnswer(selectedOptions)
  }

  function toggleOption(option: string) {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    )
  }

  // ---------------------------------------------------------------------------
  // Boolean
  // ---------------------------------------------------------------------------
  if (input.type === 'boolean') {
    return (
      <div className="flex flex-col gap-6">
        <QuestionText text={text} hint={hint} />
        <div className="flex gap-3">
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            disabled={disabled}
            onClick={() => onAnswer(true)}
          >
            Да
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            disabled={disabled}
            onClick={() => onAnswer(false)}
          >
            Нет
          </Button>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Single-choice
  // ---------------------------------------------------------------------------
  if (input.type === 'single') {
    return (
      <div className="flex flex-col gap-6">
        <QuestionText text={text} hint={hint} />
        <ul className="flex flex-col gap-2" role="listbox" aria-label={text}>
          {input.options.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                disabled={disabled}
                onClick={() => onAnswer(option)}
                className={cn(
                  'w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground leading-relaxed',
                  'transition-colors hover:border-primary hover:bg-primary/5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'disabled:pointer-events-none disabled:opacity-50',
                )}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Multi-choice
  // ---------------------------------------------------------------------------
  if (input.type === 'multi') {
    return (
      <div className="flex flex-col gap-6">
        <QuestionText text={text} hint={hint} />
        <ul className="flex flex-col gap-2" role="group" aria-label={text}>
          {input.options.map((option) => {
            const checked = selectedOptions.includes(option)
            return (
              <li key={option}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  disabled={disabled}
                  onClick={() => toggleOption(option)}
                  className={cn(
                    'w-full rounded-xl border px-4 py-3 text-left text-sm leading-relaxed',
                    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'disabled:pointer-events-none disabled:opacity-50',
                    checked
                      ? 'border-primary bg-primary/8 text-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary hover:bg-primary/5',
                  )}
                >
                  {option}
                </button>
              </li>
            )
          })}
        </ul>
        <Button
          size="lg"
          disabled={disabled || selectedOptions.length === 0}
          onClick={handleSubmitMulti}
          className="w-full"
        >
          Далее
        </Button>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Text
  // ---------------------------------------------------------------------------
  if (input.type === 'text') {
    return (
      <div className="flex flex-col gap-6">
        <QuestionText text={text} hint={hint} />
        <div className="flex flex-col gap-3">
          <label htmlFor={inputId} className="sr-only">
            {text}
          </label>
          <textarea
            id={inputId}
            rows={4}
            value={textValue}
            placeholder={input.placeholder ?? 'Введите ответ…'}
            disabled={disabled}
            onChange={(e) => setTextValue(e.target.value)}
            className={cn(
              'w-full resize-none rounded-xl border border-input bg-card px-4 py-3',
              'text-sm text-foreground placeholder:text-muted-foreground leading-relaxed',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          />
          <Button
            size="lg"
            disabled={disabled || !textValue.trim()}
            onClick={handleSubmitText}
            className="w-full"
          >
            Далее
          </Button>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Number
  // ---------------------------------------------------------------------------
  if (input.type === 'number') {
    return (
      <div className="flex flex-col gap-6">
        <QuestionText text={text} hint={hint} />
        <div className="flex flex-col gap-3">
          <label htmlFor={inputId} className="sr-only">
            {text}
          </label>
          <div className="flex items-center gap-3">
            <input
              id={inputId}
              type="number"
              inputMode="decimal"
              value={numberValue}
              placeholder={input.placeholder ?? '0'}
              min={input.min}
              max={input.max}
              disabled={disabled}
              onChange={(e) => setNumberValue(e.target.value)}
              className={cn(
                'flex-1 rounded-xl border border-input bg-card px-4 py-3',
                'text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'disabled:pointer-events-none disabled:opacity-50',
              )}
            />
            {input.unit && (
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {input.unit}
              </span>
            )}
          </div>
          <Button
            size="lg"
            disabled={disabled || !numberValue || isNaN(parseFloat(numberValue))}
            onClick={handleSubmitNumber}
            className="w-full"
          >
            Далее
          </Button>
        </div>
      </div>
    )
  }

  // Fallback — should never reach here if types are correct
  return null
}

// ---------------------------------------------------------------------------
// Sub-component: question text + optional hint
// ---------------------------------------------------------------------------

function QuestionText({ text, hint }: { text: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-lg font-semibold text-foreground text-balance leading-snug">{text}</p>
      {hint && (
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{hint}</p>
      )}
    </div>
  )
}
