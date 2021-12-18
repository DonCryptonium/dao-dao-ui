import { memoForProposal } from 'models/proposal/proposal'
import { defaultExecuteFee } from 'util/fee'
import {
  CosmosMsgFor_Empty,
  Proposal,
  ProposalResponse,
} from '@dao-dao/types/contracts/cw3-dao'
import { ProposalMapItem } from 'atoms/proposal'
import { Resetter } from 'recoil'

export function isProposal(
  proposal: Proposal | ProposalResponse | ProposalMapItem | undefined
): proposal is Proposal {
  if (!proposal) {
    return false
  }
  if ((proposal as ProposalMapItem)?.draft === false) {
    return false
  }
  return (proposal as Proposal).proposer !== undefined
}

export const createProposal =
  ({
    setLoading,
    setError,
    signingClient,
    walletAddress,
    contractAddress,
    router,
    setTransactionHash,
    resetOnChainProposals
  }: {
    setLoading: (loading: boolean) => void
    setError: (message: string) => void
    signingClient: any
    walletAddress: string
    contractAddress: string
    router: any
    setTransactionHash: (hash: string) => void,
    resetOnChainProposals: Resetter
  }) =>
  async (proposal: Proposal) => {
    setLoading(true)
    setError('')
    const memo = memoForProposal(proposal)
    try {

      const response = await signingClient?.execute(
        walletAddress,
        contractAddress,
        { propose: proposal },
        defaultExecuteFee,
        memo
      )
      setLoading(false)
      if (response) {
        resetOnChainProposals()
        setTransactionHash(response.transactionHash)
        const [{ events }] = response.logs
        const [wasm] = events.filter((e: any) => e.type === 'wasm')
        const [{ value }] = wasm.attributes.filter(
          (w: any) => w.key === 'proposal_id'
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

export const updateProposalMessage =
  ({
    proposalMapItem,
    setProposalMapItem,
  }: {
    proposalMapItem: any
    setProposalMapItem: any
  }) =>
  (messageIndex: number, msg: CosmosMsgFor_Empty) => {}
