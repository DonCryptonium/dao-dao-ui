import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import ProposalList from 'components/ProposalList'
import { useRecoilValue } from 'recoil'
import { nextDraftProposalId, nextProposalRequestId, proposals as proposalList } from 'atoms/proposal'

const DaoProposals: NextPage = () => {
  const router = useRouter()
  const contractAddress = router.query.contractAddress as string
  const requestId = useRecoilValue(nextProposalRequestId)

  const startBefore = 0;
  const proposals = useRecoilValue(proposalList({contractAddress, startBefore, requestId}))
  const hideLoadMore = true;
  const setStartBefore = (arg: number) => {};

  return (
    <>
      <div className="flex flex-col w-96 lg:w-6/12 max-w-full px-2 py-4">
        <div className="flex flex-row justify-between items-center mb-4">
          <h1 className="text-lg font-bold sm:text-3xl">Proposals</h1>
          <button
            className="btn btn-primary btn-sm text-lg"
            onClick={() =>
              router.push(`/dao/${contractAddress}/proposals/create`)
            }
          >
            + Create
          </button>
        </div>
      </div>
      <ProposalList
        proposals={proposals}
        contractAddress={contractAddress}
        hideLoadMore={hideLoadMore}
        onLoadMore={() => {
          const proposal = proposals && proposals[proposals.length - 1]
          if (proposal) {
            setStartBefore(proposal.id)
          }
        }}
      />
      <div></div>
    </>
  )
}

export default DaoProposals
