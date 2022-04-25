import { selector } from 'recoil'

import { NATIVE_DENOM } from '@dao-dao/utils'

import { stargateClientSelector } from './chain'
import { walletAddressSelector } from './keplr'

export const walletNativeBalanceSelector = selector<number | undefined>({
  key: 'walletNativeBalance',
  get: async ({ get }) => {
    const client = get(stargateClientSelector)
    const address = get(walletAddressSelector)
    if (!client || !address) return

    const balance = await client.getBalance(address, NATIVE_DENOM)
    return Number(balance.amount)
  },
})