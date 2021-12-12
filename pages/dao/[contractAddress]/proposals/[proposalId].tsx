import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import LineAlert from 'components/LineAlert'
import { isDraftProposalId, proposal as proposalItem } from 'selectors/proposal'
import { useRecoilValue } from 'recoil'
import ProposalDetails from 'components/ProposalDetails'
import ProposalEditor from 'components/ProposalEditor'

const Proposal: NextPage = () => {
  let router = useRouter()
  const contractAddress = router.query.contractAddress as string

  const proposalId = router.query.proposalId as string

  const proposalInfo = useRecoilValue(
    proposalItem({ contractAddress, proposalId })
  )

  const walletAddress = ''
  const transactionHash = ''
  const votes: any[] = []
  const vote = async () => {}
  const execute = async () => {}
  const error = undefined

  // const {
  //   walletAddress,
  //   loading,
  //   error,
  //   // proposal,
  //   votes,
  //   transactionHash,
  //   vote,
  //   execute,
  //   close,
  // } = proposalInfo

  const proposal = proposalInfo

  const initialMessage: string | undefined = router.query.initialMessage as any
  const initialMessageStatus: 'success' | 'error' | undefined = router.query
    .initialMessageStatus as any

  const initialMessageComponent =
    initialMessage && initialMessageStatus ? (
      <LineAlert msg={initialMessage} variant={initialMessageStatus} />
    ) : null

  const detailsComponent = isDraftProposalId(proposalId) ? (
    <ProposalEditor initialProposal={proposal} 
      onProposal={p => {}}
      onSaveDraft={p => {}}
      recipientAddress=""
      contractAddress={contractAddress}
    />
    ) : (
    <ProposalDetails
      proposal={proposal}
      walletAddress={walletAddress}
      votes={votes}
      vote={vote}
      execute={execute}
      close={close}
    />
  )

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="grid bg-base-100 place-items-center">
          {initialMessageComponent}
          {!proposal ? (
            <div className="text-center m-8">
              No proposal with that ID found.
            </div>
          ) : (
            <div className="container mx-auto w-96 lg:w-6/12 max-w-full text-left">
              <button
                className="btn btn-primary float-left"
                style={{ marginLeft: '-100px' }}
                onClick={(e) => {
                  e.preventDefault()
                  router.push(`/dao/${contractAddress}/proposals`)
                }}
              >
                {'< Back'}
              </button>

              {detailsComponent}

              {error && (
                <LineAlert className="mt-2" variant="error" msg={error} />
              )}

              {transactionHash.length > 0 && (
                <div className="mt-8">
                  <LineAlert
                    variant="success"
                    msg={`Success! Transaction Hash: ${transactionHash}`}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Proposal
