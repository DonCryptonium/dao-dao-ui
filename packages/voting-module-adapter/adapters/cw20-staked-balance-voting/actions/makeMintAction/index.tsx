import { useWallet } from '@cosmos-wallet/react'
import { useCallback, useMemo } from 'react'

import {
  Action,
  ActionComponent,
  ActionKey,
  UseDecodedCosmosMsg,
  UseDefaults,
  UseTransformToCosmos,
} from '@dao-dao/actions'
import {
  convertDenomToMicroDenomWithDecimals,
  convertMicroDenomToDenomWithDecimals,
  makeExecutableMintMessage,
  makeMintMessage,
} from '@dao-dao/utils'

import { useGovernanceTokenInfo } from '../../hooks'
import {
  MintIcon,
  MintComponent as StatelessMintComponent,
} from './MintComponent'

export interface MintData {
  to: string
  amount: number
}

const useDefaults: UseDefaults<MintData> = (): MintData => {
  const { address } = useWallet()

  return {
    to: address ?? '',
    amount: 1,
  }
}

const useTransformToCosmos: UseTransformToCosmos<MintData> = () => {
  const { governanceTokenAddress, governanceTokenInfo } =
    useGovernanceTokenInfo()

  return useCallback(
    (data: MintData) => {
      const amount = convertDenomToMicroDenomWithDecimals(
        data.amount,
        governanceTokenInfo.decimals
      )
      return makeExecutableMintMessage(
        makeMintMessage(amount, data.to),
        governanceTokenAddress
      )
    },
    [governanceTokenAddress, governanceTokenInfo.decimals]
  )
}

const useDecodedCosmosMsg: UseDecodedCosmosMsg<MintData> = (
  msg: Record<string, any>
) => {
  const { governanceTokenAddress, governanceTokenInfo } =
    useGovernanceTokenInfo()

  return useMemo(() => {
    if (
      'wasm' in msg &&
      'execute' in msg.wasm &&
      'contract_addr' in msg.wasm.execute &&
      // Mint action only supports minting our own governance token. Let
      // custom action handle the rest of the mint messages for now.
      msg.wasm.execute.contract_addr === governanceTokenAddress &&
      'mint' in msg.wasm.execute.msg &&
      'amount' in msg.wasm.execute.msg.mint &&
      'recipient' in msg.wasm.execute.msg.mint
    ) {
      return {
        match: true,
        data: {
          to: msg.wasm.execute.msg.mint.recipient,
          amount: convertMicroDenomToDenomWithDecimals(
            msg.wasm.execute.msg.mint.amount,
            governanceTokenInfo.decimals
          ),
        },
      }
    }

    return { match: false }
  }, [governanceTokenAddress, governanceTokenInfo.decimals, msg])
}

const Component: ActionComponent = (props) => {
  const { governanceTokenInfo } = useGovernanceTokenInfo()

  return (
    <StatelessMintComponent
      {...props}
      options={{
        govTokenSymbol: governanceTokenInfo.symbol ?? 'gov tokens',
      }}
    />
  )
}

export const makeMintAction = (): Action<MintData> => ({
  key: ActionKey.Mint,
  Icon: MintIcon,
  label: 'Mint',
  description: 'Mint new governance tokens.',
  Component,
  useDefaults,
  useTransformToCosmos,
  useDecodedCosmosMsg,
})
