import ProposalEditor from 'components/ProposalEditor'
///import { useSigningClient } from 'contexts/cosmwasm'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { EmptyProposal, memoForProposal } from 'models/proposal/proposal'
import { defaultExecuteFee } from 'util/fee'
import Link from 'next/link'
import { Proposal } from '@dao-dao/types/contracts/cw3-dao'
import { createDraftProposalTransaction, createProposal } from 'util/proposal'
import {
  useRecoilState,
  useRecoilTransaction_UNSTABLE,
  useRecoilValue,
  useResetRecoilState,
} from 'recoil'
import {
  draftProposal,
  draftProposalItem,
  nextDraftProposalId as nextDraftProposalIdAtom,
  onChainProposals,
  draftProposals as draftProposalsAtom,
} from 'atoms/proposal'
import {
  cosmWasmSigningClient as cosmWasmSigningClientAtom,
  walletAddress as walletAddressAtom,
} from 'atoms/cosm'
import {
  transactionHash as transactionHashAtom,
  loading as loadingAtom,
  error as errorAtom,
} from 'atoms/status'

const ProposalCreate: NextPage = () => {
  const router = useRouter()
  const contractAddress = router.query.contractAddress as string
  const [nextDraftProposalId, setNextDraftProposalId] = useRecoilState<number>(
    nextDraftProposalIdAtom
  )
  const walletAddress = useRecoilValue(walletAddressAtom(undefined))
  const error = useRecoilValue(errorAtom)
  const loading = useRecoilValue(loadingAtom)
  const [proposalId, setProposalId] = useState<number>(-1)
  const draftProposals = useRecoilValue(draftProposalsAtom(contractAddress))
  const createDraftProposal = useRecoilTransaction_UNSTABLE(
    createDraftProposalTransaction(contractAddress, draftProposals),
    [contractAddress]
  )

  useEffect(() => {
    if (proposalId < 0) {
      const nextId = nextDraftProposalId + 1
      // setNextDraftProposalId(nextId)
      createDraftProposal(contractAddress, {
        draftProposal: { ...EmptyProposal },
      })
      setProposalId(nextId)
    }
  }, [contractAddress, createDraftProposal, nextDraftProposalId, proposalId])

  // const handleProposal = createProposal({
  //   contractAddress,
  //   // router,
  //   walletAddress,
  //   signingClient,
  //   setTransactionHash,
  //   setError,
  //   setLoading,
  //   // resetOnChainProposals
  // })

  return (
    <>
      <div className="flex flex-col w-full">
        <Link href={`/dao/${contractAddress}/proposals`}>Proposals</Link>
        <ProposalEditor
          // onProposal={handleProposal}
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
