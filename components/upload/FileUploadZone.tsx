'use client'
// components/upload/FileUploadZone.tsx
// Drag-and-drop + tap-to-browse file input for supported medical documents.
// Validates MIME type and file size client-side before calling onFile.

import { useCallback, useRef, useState } from 'react'
import { UploadCloudIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@/types/upload.types'

interface FileUploadZoneProps {
  onFile: (file: File) => void
  disabled?: boolean
}

const ACCEPT_ATTR = ACCEPTED_MIME_TYPES.join(',')
const MAX_MB = MAX_FILE_SIZE_BYTES / (1024 * 1024)

function validateFile(file: File): string | null {
  if (!ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
    return 'Поддерживаются только PDF, JPEG и PNG.'
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `Файл слишком большой. Максимум ${MAX_MB} МБ.`
  }
  return null
}

export function FileUploadZone({ onFile, disabled = false }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      const err = validateFile(file)
      if (err) {
        setValidationError(err)
        return
      }
      setValidationError(null)
      onFile(file)
    },
    [onFile],
  )

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      e.target.value = ''
    },
    [handleFile],
  )

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Загрузить файл анализов"
        aria-disabled={disabled}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        className={cn(
          'flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed',
          'px-6 py-12 text-center transition-colors duration-200 cursor-pointer select-none',
          dragOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/30',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <UploadCloudIcon className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            Нажмите или перетащите файл
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, JPEG, PNG — до {MAX_MB} МБ
          </p>
        </div>
      </div>

      {validationError && (
        <p role="alert" className="text-xs text-destructive px-1">
          {validationError}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        onChange={onInputChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  )
}
