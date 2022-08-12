import { useWallet } from '@cosmos-wallet/react'
import { useTranslation } from 'react-i18next'

import { ConnectWalletButton } from '@dao-dao/common'
import { useCw4VotingModule, useVotingModule } from '@dao-dao/state'
import {
  MultisigMemberList,
  MultisigMemberListLoader,
  SuspenseLoader,
} from '@dao-dao/ui'

import { useVotingModuleAdapterOptions } from '../../../react/context'

export const SdaMembershipPage = () => {
  const { t } = useTranslation()

  const { coreAddress, Loader } = useVotingModuleAdapterOptions()
  const { connected, address: walletAddress } = useWallet()
  const { walletVotingWeight, totalVotingWeight } = useVotingModule(
    coreAddress,
    {
      fetchMembership: true,
    }
  )
  const { members } = useCw4VotingModule(coreAddress, { fetchMembers: true })

  if (!members || totalVotingWeight === undefined) {
    throw new Error(t('error.loadingData'))
  }

  return (
    <div className="space-y-8">
      {!connected && <ConnectWalletButton />}

      <SuspenseLoader fallback={<MultisigMemberListLoader Loader={Loader} />}>
        <MultisigMemberList
          members={members}
          totalWeight={totalVotingWeight}
          walletAddress={walletAddress}
          walletWeight={walletVotingWeight}
        />
      </SuspenseLoader>
    </div>
  )
}
