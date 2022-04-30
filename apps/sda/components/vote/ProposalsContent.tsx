import { useMemo, useState } from 'react'
import { useRecoilValue, constSelector } from 'recoil'

import { Status } from '@dao-dao/state/clients/cw-proposal-single'
import { proposalModulesSelector } from '@dao-dao/state/recoil/selectors/clients/cw-core'
import { listProposalsSelector, reverseProposalsSelector } from '@dao-dao/state/recoil/selectors/clients/cw-proposal-single'

import ProposalList from './ProposalList'
import { DAO_ADDRESS } from '@/util'

export const ProposalsContent = () => {
  const proposalModuleAddress = useRecoilValue(
    proposalModulesSelector({ contractAddress: DAO_ADDRESS, params: [{}] })
  )?.[0]

  const [startBefore, setStartBefore] = useState<number | undefined>(undefined)
  const limit = 30

  const allProposalResponses = useRecoilValue(
    proposalModuleAddress
      ? reverseProposalsSelector({
          contractAddress: proposalModuleAddress,
        params: [{limit, startBefore}],
        })
      : constSelector(undefined)
  )?.proposals

  const openProposalResponses = useMemo(() => {
    if (!allProposalResponses) return []
    return allProposalResponses.filter(
      ({ proposal: { status } }) => status === Status.Open
    )
  }, [allProposalResponses])

  const historyProposalResponses = useMemo(() => {
    if (!allProposalResponses) return []
    return allProposalResponses
      .filter(({ proposal: { status } }) => status !== Status.Open)
      .reverse()
  }, [allProposalResponses])



  return (
    <div>
      {/* Only display open/none open if there are proposals. If there are
       * no proposals, the user will still see the 'No history' messsage at
       * the bottom of the page.
       */}
      {!!allProposalResponses?.length && (
        <ProposalList
          noneLabel="None open"
          proposals={openProposalResponses}
          statusLabel="Open"
        />
      )}

      <ProposalList
        noneLabel="No history"
        proposals={historyProposalResponses}
        statusLabel="History"
      />
    </div>
  )
}
