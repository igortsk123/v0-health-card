import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

/**
 * Outer page wrapper providing consistent header + content + footer layout.
 * All screens should be wrapped in AppShell.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
          <a href="/" className="text-base font-semibold text-foreground tracking-tight">
            Второе мнение
          </a>
          {/* TODO: add navigation / progress indicator per stage */}
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        {children}
      </div>

      <footer className="border-t border-border mt-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 sm:px-6">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Информационная поддержка. Не является медицинским заключением.
          </p>
        </div>
      </footer>
    </div>
  )
}
