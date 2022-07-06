import { FC } from 'react'
import { useRecoilValue, waitForAll } from 'recoil'

import {
  Cw20BaseSelectors,
  CwCoreSelectors,
  addressTVLSelector,
  nativeBalancesSelector,
} from '@dao-dao/state'
import { TreasuryBalances as StatelessTreasuryBalances } from '@dao-dao/ui'
import {
  NATIVE_DECIMALS,
  NATIVE_DENOM,
  nativeTokenDecimals,
} from '@dao-dao/utils'

import { useDAOInfoContext } from './DAOPageWrapper'

export const TreasuryBalances: FC = () => {
  const { coreAddress } = useDAOInfoContext()

  const nativeBalances =
    useRecoilValue(nativeBalancesSelector(coreAddress)) ?? []

  const cw20s = useRecoilValue(
    CwCoreSelectors.cw20BalancesInfoSelector({ address: coreAddress })
  )

  const cw20MarketingInfo = useRecoilValue(
    waitForAll(
      cw20s.map(({ denom }) =>
        Cw20BaseSelectors.marketingInfoSelector({
          contractAddress: denom,
          params: [],
        })
      )
    )
  )

  const cw20Tokens = cw20s.map((info, idx) => {
    const logoInfo = cw20MarketingInfo[idx]?.logo

    return {
      ...info,
      imageUrl:
        !!logoInfo && logoInfo !== 'embedded' && 'url' in logoInfo
          ? logoInfo.url
          : undefined,
    }
  })

  const nativeTokens = nativeBalances.length
    ? nativeBalances.map(({ denom, amount }) => ({
        denom: denom,
        amount,
        decimals: nativeTokenDecimals(denom) || NATIVE_DECIMALS,
      }))
    : [{ denom: NATIVE_DENOM, amount: '0', decimals: NATIVE_DECIMALS }]

  const usdcValue = useRecoilValue(addressTVLSelector({ address: coreAddress }))

  return (
    <StatelessTreasuryBalances
      cw20Tokens={cw20Tokens}
      nativeTokens={nativeTokens}
      usdcValue={usdcValue}
    />
  )
}