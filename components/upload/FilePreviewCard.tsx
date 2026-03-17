'use client'
// components/upload/FilePreviewCard.tsx
// Shows selected file metadata (name, size, type) with a remove button.

import { FileTextIcon, ImageIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FilePreviewCardProps {
  fileName: string
  fileSize: number   // bytes
  mimeType: string
  onRemove: () => void
  className?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
  }
  return <FileTextIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
}

export function FilePreviewCard({
  fileName,
  fileSize,
  mimeType,
  onRemove,
  className,
}: FilePreviewCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3',
        className,
      )}
    >
      <FileIcon mimeType={mimeType} />
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(fileSize)}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label="Удалить файл"
        className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
      >
        <XIcon className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
