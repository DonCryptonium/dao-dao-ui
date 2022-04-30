import { ChevronDownIcon } from '@heroicons/react/solid'
import clsx from 'clsx'
import { VFC, useState } from 'react'

import { ProposalResponse } from '@dao-dao/state/clients/cw-proposal-single'
import { Button } from '@dao-dao/ui'

import { ProposalItem } from './ProposalItem'

interface IProposalList {
  proposals: ProposalResponse[]
  statusLabel: string
  noneLabel: string
}

const PROPOSAL_INIT_LIMIT = 10

const ProposalList: VFC<IProposalList> = ({
  proposals,
  statusLabel = 'No proposals found',
  noneLabel = '',
}) => {
  const [showAll, setShowAll] = useState(false)
  return (
    <>
      <h2 className="flex gap-2 items-center mb-4 caption-text">
        <ChevronDownIcon
          className={clsx('w-4 h-4', {
            '-rotate-90': proposals.length === 0,
          })}
        />{' '}
        {proposals.length === 0 ? noneLabel : statusLabel}
      </h2>

      {proposals.length > 0 && (
        <div className="mb-8 space-y-1">
          {proposals.map(
            (proposal, index) =>
              (showAll || index < PROPOSAL_INIT_LIMIT) && (
                <ProposalItem key={proposal.id} proposalResponse={proposal} />
              )
          )}
          {!showAll && proposals.length > PROPOSAL_INIT_LIMIT && (
            <Button
              className="justify-center p-4 w-full text-sm bg-card hover:bg-secondary rounded"
              onClick={() => setShowAll(true)}
              variant="ghost"
            >
              Load {proposals.length - PROPOSAL_INIT_LIMIT} older proposals
            </Button>
          )}
        </div>
      )}
    </>
  )
}

export default ProposalList
