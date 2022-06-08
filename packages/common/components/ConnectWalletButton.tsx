import { isMobile } from '@walletconnect/browser-utils'
import clsx from 'clsx'
import { FC } from 'react'

import { useWallet } from '@dao-dao/state'
import {
  WalletConnect,
  MobileWalletConnect,
  NoMobileWallet,
  WalletConnectProps,
} from '@dao-dao/ui'
import {
  NATIVE_DECIMALS,
  NATIVE_DENOM,
  convertDenomToHumanReadableDenom,
  convertMicroDenomToDenomWithDecimals,
  CHAIN_ID,
} from '@dao-dao/utils'

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
    address,
    name,
    nativeBalance,
    isMobileWeb,
    connected,
  } = useWallet()

  const walletBalanceHuman = convertMicroDenomToDenomWithDecimals(
    nativeBalance ?? 0,
    NATIVE_DECIMALS
  )
  const chainDenomHuman =
    convertDenomToHumanReadableDenom(NATIVE_DENOM).toUpperCase()

  if (mobile && isMobile() && CHAIN_ID !== 'juno-1') {
    return <NoMobileWallet />
  }

  return mobile ? (
    <MobileWalletConnect
      className={clsx('w-full', className)}
      connected={connected}
      onConnect={connect}
      onDisconnect={isMobileWeb ? undefined : disconnect}
      walletAddress={address ?? ''}
      walletBalance={walletBalanceHuman}
      walletBalanceDenom={chainDenomHuman}
      walletName={name}
      {...props}
    />
  ) : (
    <WalletConnect
      className={clsx('w-full', className)}
      connected={connected}
      onConnect={connect}
      onDisconnect={isMobileWeb ? undefined : disconnect}
      walletAddress={address ?? ''}
      walletBalance={walletBalanceHuman}
      walletBalanceDenom={chainDenomHuman}
      walletName={name}
      {...props}
    />
  )
}