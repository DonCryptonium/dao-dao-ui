import ProposalCard from 'components/ProposalCard'
import { ProposalResponse, Timestamp } from '@dao-dao/types/contracts/cw3-dao'
import { ProposalMapItem } from 'atoms/proposal'

type Expiration = {
  at_time: Timestamp
}

function ProposalList({
  contractAddress,
  proposals,
  hideLoadMore,
  onLoadMore,
}: {
  contractAddress: string
  proposals: ProposalMapItem[]
  hideLoadMore: boolean
  onLoadMore: () => void
}) {
  return (
    <div className="w-96 lg:w-6/12 max-w-full">
      {proposals?.length === 0 && (
        <div className="text-center">
          No proposals found, please create a proposal.
        </div>
      )}
      {proposals &&
        proposals.map((proposal, idx) => {
          const { title, id, status } = proposal.proposal
          let expires: Expiration
          if (typeof id !== 'number') {
            expires = {
              at_time: '0' 
            }
          } else {
            expires = proposal.proposal?.expires as Expiration
          }
          

          return (
            <ProposalCard
              key={`${id}_${idx}`}
              title={title}
              id={`${id}`}
              status={status}
              expires_at={parseInt(expires.at_time)}
              contractAddress={contractAddress}
            />
          )
        })}
      {!hideLoadMore && (
        <button
          className="btn btn-primary btn-outline text-lg w-full mt-2"
          onClick={onLoadMore}
        >
          Load More
        </button>
      )}
    </div>
  )
}

export default ProposalList
