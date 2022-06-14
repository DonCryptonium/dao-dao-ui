import '@dao-dao/ui/styles/index.css'
import '@fontsource/inter/latin.css'
import '@fontsource/jetbrains-mono/latin.css'

import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect, FC } from 'react'
import { RecoilRoot, useRecoilState, useSetRecoilState } from 'recoil'

import {
  activeThemeAtom,
  mountedInBrowserAtom,
  WalletProvider,
} from '@dao-dao/state'
import { Theme, ThemeProvider, Notifications } from '@dao-dao/ui'

import ErrorBoundary from '@/components/ErrorBoundary'
import { HomepageLayout } from '@/components/HomepageLayout'
import { SidebarLayout } from '@/components/SidebarLayout'

const InnerApp: FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter()

  const setMountedInBrowser = useSetRecoilState(mountedInBrowserAtom)
  const [theme, setTheme] = useRecoilState(activeThemeAtom)
  const [accentColor, setAccentColor] = useState<string | undefined>()

  // Indicate that we are mounted.
  useEffect(() => setMountedInBrowser(true), [setMountedInBrowser])

  // Ensure correct theme class is set on document.
  useEffect(() => {
    Object.values(Theme).forEach((value) =>
      document.documentElement.classList.toggle(value, value === theme)
    )
  }, [theme])

  const Layout = router.pathname === '/' ? HomepageLayout : SidebarLayout

  return (
    <>
      <Head>
        <meta
          content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
          name="viewport"
        />
      </Head>
      <ErrorBoundary title="An unexpected error occurred.">
        <ThemeProvider
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          theme={theme}
          updateTheme={setTheme}
        >
          <Layout>
            <Component {...pageProps} />
          </Layout>

          <Notifications />
        </ThemeProvider>
      </ErrorBoundary>
    </>
  )
}

const dApp: FC<AppProps> = (props) => (
  <RecoilRoot>
    <WalletProvider>
      <InnerApp {...props} />
    </WalletProvider>
  </RecoilRoot>
)

export default dApp
