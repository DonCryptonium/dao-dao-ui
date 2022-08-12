import { useWalletManager } from '@cosmos-wallet/react'
import { isMobile } from '@walletconnect/browser-utils'
import clsx from 'clsx'
import { FC, useEffect, useState } from 'react'

import { useWalletBalance } from '@dao-dao/state'
import {
  MobileWalletConnect,
  NoMobileWallet,
  WalletConnect,
  WalletConnectProps,
} from '@dao-dao/ui'
import { CHAIN_ID, NATIVE_DENOM, nativeTokenLabel } from '@dao-dao/utils'

export interface ConnectWalletButtonProps extends Partial<WalletConnectProps> {
  mobile?: boolean
}

export const ConnectWalletButton: FC<ConnectWalletButtonProps> = ({
  mobile,
  className,
  ...props
}) => {
  const {
    connect,
    disconnect,
    connected,
    connectedWallet: { name, address } = {},
  } = useWalletManager()
  const { walletBalance = 0 } = useWalletBalance()

  // Check if in Keplr Mobile built-in browser mode.
  const [isEmbeddedKeplrMobileWeb, setIsEmbeddedKeplrMobileWeb] =
    useState(false)
  useEffect(() => {
    import('@keplr-wallet/stores')
      .then(({ getKeplrFromWindow }) => getKeplrFromWindow())
      .then(
        (keplr) =>
          keplr &&
          keplr.mode === 'mobile-web' &&
          setIsEmbeddedKeplrMobileWeb(true)
      )
  }, [])

  if (mobile && isMobile() && CHAIN_ID !== 'juno-1') {
    return <NoMobileWallet />
  }

  return mobile ? (
    <MobileWalletConnect
      className={clsx('w-full', className)}
      connected={connected}
      onConnect={connect}
      // Don't allow disconnecting if in Keplr Mobile web mode.
      onDisconnect={isEmbeddedKeplrMobileWeb ? undefined : disconnect}
      walletAddress={address ?? ''}
      walletBalance={walletBalance}
      walletBalanceDenom={nativeTokenLabel(NATIVE_DENOM)}
      walletName={name}
      {...props}
    />
  ) : (
    <WalletConnect
      className={className}
      connected={connected}
      onConnect={connect}
      // Don't allow disconnecting if in Keplr Mobile web mode.
      onDisconnect={isEmbeddedKeplrMobileWeb ? undefined : disconnect}
      walletAddress={address ?? ''}
      walletBalance={walletBalance}
      walletBalanceDenom={nativeTokenLabel(NATIVE_DENOM)}
      walletName={name}
      {...props}
    />
  )
}
