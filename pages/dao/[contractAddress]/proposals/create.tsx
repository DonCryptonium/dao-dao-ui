import LineAlert from 'components/LineAlert'
import ProposalEditor from 'components/ProposalEditor'
import { useSigningClient } from 'contexts/cosmwasm'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { memoForProposal, DraftProposal } from 'models/proposal/proposal'
import { messageForProposal } from 'models/proposal/proposalSelectors'
import { defaultExecuteFee } from 'util/fee'
import { useRecoilValue, useRecoilState } from 'recoil'
import {
  isDraftProposalId,
  nextDraftProposalIdSelector,
} from 'selectors/proposal'
import { draftProposalMap } from 'atoms/proposal'
import Link from 'next/link'

const ProposalCreate: NextPage = () => {
  const router = useRouter()
  const contractAddress = router.query.contractAddress as string

  const { walletAddress, signingClient } = useSigningClient()
  const [transactionHash, setTransactionHash] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const proposalId = useRecoilValue<string>(nextDraftProposalIdSelector)
  // const [proposalMap, setProposalMap] = useRecoilState(draftProposalMap)

  // const saveDraftProposal = (proposal: DraftProposal) => {
  //   setProposalMap({
  //     ...proposalMap,
  //     [proposalId]: { ...proposal, id: proposalId },
  //   })
  // }

  const handleProposal = async (proposal: DraftProposal) => {
    setLoading(true)
    setError('')
    const propose = messageForProposal(proposal, contractAddress)
    const memo = memoForProposal(proposal)
    try {
      const response = await signingClient?.execute(
        walletAddress,
        contractAddress,
        { propose },
        defaultExecuteFee,
        memo
      )
      setLoading(false)
      if (response) {
        setTransactionHash(response.transactionHash)
        const [{ events }] = response.logs
        const [wasm] = events.filter((e) => e.type === 'wasm')
        const [{ value }] = wasm.attributes.filter(
          (w) => w.key === 'proposal_id'
        )
        const initialMessage = `Saved Proposal "${proposal.title}"`
        const paramStr = `initialMessage=${initialMessage}&initialMessageStatus=success`

        router.push(`/dao/${contractAddress}/proposals/${value}?${paramStr}`)
      }
    } catch (e: any) {
      console.error(
        `Error submitting proposal ${JSON.stringify(proposal, undefined, 2)}`
      )
      console.dir(e)
      console.error(e.message)
      setLoading(false)
      setError(e.message)
    }
  }

  const content = !isDraftProposalId(proposalId) ? (
    <div>
      <a
        href={`/dao/${contractAddress}/proposals/${proposalId}`}
      >{`${proposalId} saved`}</a>
      <LineAlert className="mt-2" variant="success" msg="Proposal Saved" />
    </div>
  ) : (
    <ProposalEditor
      onProposal={handleProposal}
      // onSaveDraft={saveDraftProposal}
      error={error}
      loading={loading}
      contractAddress={contractAddress}
      recipientAddress={walletAddress}
    />
  )

  return (
    <>
      <div className="flex flex-col w-full">
        <Link href={`/dao/${contractAddress}/proposals`}>Proposals</Link>
        {content}
      </div>
    </>
  )
}

export default ProposalCreate
