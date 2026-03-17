'use client'
// app/upload/page.tsx
// Step 1 of funnel: file selection + client-side validation + upload trigger.
// On success, saves uploadId to session and navigates to /upload/parsing.

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/shared/AppShell'
import { StageHeader } from '@/components/shared/StageHeader'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { DisclaimerBlock } from '@/components/shared/DisclaimerBlock'
import { ErrorState } from '@/components/shared/ErrorState'
import { FileUploadZone } from '@/components/upload/FileUploadZone'
import { FilePreviewCard } from '@/components/upload/FilePreviewCard'
import { CtaGroup } from '@/components/shared/CtaGroup'
import { useSession } from '@/context/SessionContext'
import { uploadFile } from '@/services/uploadService'

type UploadState = 'idle' | 'uploading' | 'error'

export default function UploadPage() {
  const router = useRouter()
  const { setSession } = useSession()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    setSelectedFile(file)
    setUploadState('idle')
    setErrorMessage(null)
  }, [])

  const handleRemove = useCallback(() => {
    setSelectedFile(null)
    setUploadState('idle')
    setErrorMessage(null)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!selectedFile) return
    setUploadState('uploading')
    setErrorMessage(null)

    const result = await uploadFile({ file: selectedFile })

    if (result.error || !result.data) {
      setUploadState('error')
      setErrorMessage(result.error ?? 'Не удалось загрузить файл.')
      return
    }

    setSession({ uploadId: result.data.uploadId, stage: 'parsing' })
    router.push('/upload/parsing')
  }, [selectedFile, setSession, router])

  return (
    <AppShell>
      <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 max-w-2xl mx-auto w-full">
        <ProgressBar step={1} totalSteps={4} />

        <StageHeader
          title="Загрузите результаты анализов"
          subtitle="Фотография или PDF с лабораторными данными. Поддерживаются JPEG, PNG, PDF — до 10 МБ."
          step={1}
          totalSteps={4}
        />

        {selectedFile ? (
          <FilePreviewCard
            fileName={selectedFile.name}
            fileSize={selectedFile.size}
            mimeType={selectedFile.type}
            onRemove={handleRemove}
          />
        ) : (
          <FileUploadZone
            onFile={handleFile}
            disabled={uploadState === 'uploading'}
          />
        )}

        {uploadState === 'error' && errorMessage && (
          <ErrorState
            message={errorMessage}
            onRetry={() => { setUploadState('idle'); setErrorMessage(null) }}
          />
        )}

        {selectedFile && uploadState !== 'error' && (
          <CtaGroup
            primary={{
              label: uploadState === 'uploading' ? 'Загружаем…' : 'Продолжить',
              onClick: handleSubmit,
              disabled: uploadState === 'uploading',
            }}
            secondary={{
              label: 'Выбрать другой файл',
              onClick: handleRemove,
              disabled: uploadState === 'uploading',
            }}
          />
        )}

        <DisclaimerBlock />
      </main>
    </AppShell>
  )
}
