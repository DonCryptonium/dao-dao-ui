import { useRouter } from 'next/router'
import {
  FunctionComponent,
  SuspenseProps,
  Suspense,
  ComponentType,
} from 'react'
import { useRecoilValue } from 'recoil'

import { mountedInBrowserAtom } from '@dao-dao/state'

export interface SuspenseLoaderProps extends SuspenseProps {
  ErrorBoundaryComponent: ComponentType
  forceFallback?: boolean
}

export const SuspenseLoader: FunctionComponent<SuspenseLoaderProps> = ({
  ErrorBoundaryComponent,
  forceFallback,
  fallback,
  children,
  ...props
}) => {
  const { isFallback, isReady } = useRouter()

  // Prevent loading on the server since Next.js cannot intuitively
  // pre-render Suspenses.
  const mountedInBrowser = useRecoilValue(mountedInBrowserAtom)

  return !mountedInBrowser || forceFallback || isFallback || !isReady ? (
    <>{fallback}</>
  ) : (
    <ErrorBoundaryComponent>
      <Suspense fallback={fallback} {...props}>
        {children}
      </Suspense>
    </ErrorBoundaryComponent>
  )
}