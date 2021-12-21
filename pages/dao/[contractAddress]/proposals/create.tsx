import ProposalEditor from 'components/ProposalEditor'
///import { useSigningClient } from 'contexts/cosmwasm'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { memoForProposal } from 'models/proposal/proposal'
import { defaultExecuteFee } from 'util/fee'
import Link from 'next/link'
import { Proposal } from '@dao-dao/types/contracts/cw3-dao'
import { createProposal } from 'util/proposal'
import {useRecoilState, useRecoilValue, useResetRecoilState} from 'recoil'
import { draftProposal, draftProposalItem, nextDraftProposalId as nextDraftProposalIdAtom, onChainProposals } from 'atoms/proposal'
import { cosmWasmSigningClient as cosmWasmSigningClientAtom, walletAddress as walletAddressAtom  } from 'atoms/cosm'

const ProposalCreate: NextPage = () => {
  const router = useRouter()
  const contractAddress = router.query.contractAddress as string
  const [nextDraftProposalId, setNextDraftProposalId] = useRecoilState<number>(nextDraftProposalIdAtom)
  const walletAddress = useRecoilValue(walletAddressAtom(undefined))
  const [transactionHash, setTransactionHash] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [proposalId, setProposalId] = useState<number>(-1)
  const signingClient = useRecoilValue(cosmWasmSigningClientAtom(undefined))
  const resetOnChainProposals = useResetRecoilState(onChainProposals(undefined))

  if (proposalId < 0) {
    const nextId = nextDraftProposalId + 1
    setNextDraftProposalId(nextId)
    setProposalId(nextId)
  }

  const handleProposal = createProposal({
    contractAddress,
    router,
    walletAddress,
    signingClient,
    setTransactionHash,
    setError,
    setLoading,
    resetOnChainProposals
  })

  return (
    <>
      <div className="flex flex-col w-full">
        <Link href={`/dao/${contractAddress}/proposals`}>Proposals</Link>
        <ProposalEditor
          onProposal={handleProposal}
          proposalId={proposalId}
          error={error}
          loading={loading}
          contractAddress={contractAddress}
          recipientAddress={walletAddress}
        />
      </div>
    </>
  )
}

export default ProposalCreate
