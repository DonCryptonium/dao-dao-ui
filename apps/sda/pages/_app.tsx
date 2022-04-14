import 'ui/globals.css'

import { useState, useEffect, Suspense } from 'react'

import type { AppProps } from 'next/app'

import { RecoilRoot, useRecoilState } from 'recoil'

import { ThemeProvider, Theme } from 'ui'

import { activeTheme } from '@/atoms/theme'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingScreen } from '@/components/LoadingScreen'
import { Notifications } from '@/components/Notifications'

export default function MyApp({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useRecoilState(activeTheme)
  const [accentColor, setAccentColor] = useState<string | undefined>()

  // Ensure correct theme class is set on document.
  useEffect(() => {
    Object.values(Theme).forEach((value) =>
      document.documentElement.classList.toggle(value, value === theme)
    )
  }, [theme])

  return (
    <RecoilRoot>
      <ThemeProvider
        accentColor={accentColor}
        setAccentColor={setAccentColor}
        theme={theme}
        updateTheme={setTheme}
      >
        <ErrorBoundary title="An unexpected error occurred.">
          <Suspense fallback={<LoadingScreen />}>
            <Component {...pageProps} />
          </Suspense>

          <Notifications />
        </ErrorBoundary>
      </ThemeProvider>
    </RecoilRoot>
  )
}
