import LineAlert from 'components/LineAlert'
import ProposalDetails from 'components/ProposalDetails'
import ProposalEditor from 'components/ProposalEditor'
import { useSigningClient } from 'contexts/cosmwasm'
import { EmptyProposal } from 'models/proposal/proposal'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useRecoilValue, useRecoilState } from 'recoil'
import { createProposal } from 'util/proposal'
import { ProposalMapItem, proposal as proposalItem } from 'atoms/proposal'

const Proposal: NextPage = () => {
  let router = useRouter()
  const contractAddress = router.query.contractAddress as string

  const proposalId = parseInt((router.query.proposalId as string) ?? '-1', 10)

  // const [proposalInfo, setProposalMapItem] = useRecoilState<
  //   ProposalMapItem | undefined
  // >(makeProposalItemAtom(contractAddress, proposalId))

  const proposalInfo = useRecoilValue<ProposalMapItem | undefined>(
    proposalItem({ contractAddress, proposalId })
  )

  // console.dir(proposalInfoItem)

  // const proposalInfo = useRecoilValue(
  //   proposalItem({ contractAddress, proposalId })
  // )

  // const walletAddress = ''
  // const transactionHash = ''
  const votes: any[] = []
  const vote = async () => {}
  const execute = async () => {}
  // const error = undefined

  // const proposal = isProposal(proposalInfo?.proposal)
  //   ? proposalInfo?.proposal
  //   : { ...EmptyProposal }

  // const router = useRouter()
  // const contractAddress = router.query.contractAddress as string

  const { walletAddress, signingClient } = useSigningClient()
  const [transactionHash, setTransactionHash] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!proposalInfo) {
    // Item was removed, so we can't render it
    const proposalsListRoute = `/dao/${contractAddress}/proposals`
    router.push(proposalsListRoute)
    return <h1>Error: proposal id {proposalId} not found</h1>
  }

  const handleProposal = createProposal({
    contractAddress,
    router,
    walletAddress,
    signingClient,
    setTransactionHash,
    setError,
    setLoading,
    resetOnChainProposals: () => {}
  })

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

  /// const proposal = proposalInfo.proposal

  const initialMessage: string | undefined = router.query.initialMessage as any
  const initialMessageStatus: 'success' | 'error' | undefined = router.query
    .initialMessageStatus as any

  const initialMessageComponent =
    initialMessage && initialMessageStatus ? (
      <LineAlert msg={initialMessage} variant={initialMessageStatus} />
    ) : null

  const detailsComponent = proposalInfo?.draft ? (
    <ProposalEditor
      proposalId={proposalId}
      onProposal={handleProposal}
      recipientAddress=""
      contractAddress={contractAddress}
    />
  ) : (
    <ProposalDetails
      contractAddress={contractAddress}
      proposalId={proposalId}
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
          {!proposalInfo ? (
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
