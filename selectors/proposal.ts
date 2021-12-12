import { selectorFamily, useRecoilState } from 'recoil'
import { cosmWasmClient } from 'selectors/cosm'
import {
  DRAFT_SIGIL,
  draftProposalMap,
} from 'atoms/proposal'

export function isDraftProposalId(proposalId: string): boolean {
  if (!proposalId?.length) {
    return true
  }
  return proposalId[0] === DRAFT_SIGIL
}

export const nextDraftProposalIdSelector = selectorFamily({
  key: 'NextDraftProposalId',
  get:  () => ({get}) => {
    const map = get(draftProposalMap)
    const nextNumericId = Object.values(map).length
    const proposalId = `${DRAFT_SIGIL}_${nextNumericId}`
    return proposalId
  }
})

export const draftProposal = selectorFamily({
  key: 'ProposalDraft',
  get:
    (proposalId: string) =>
    ({ get }) => {
      const draftMap = get(draftProposalMap)
      return draftMap[proposalId]
    },
})

export const proposals = selectorFamily({
  key: 'ProposalList',
  get:
    ({
      contractAddress,
      startBefore,
    }: {
      contractAddress: string
      startBefore: number
    }) =>
    async ({ get }) => {
      const draftProposals = Object.values(get(draftProposalMap))
      const client = get(cosmWasmClient)
      const { proposals } = await client?.queryContractSmart(contractAddress, {
        reverse_proposals: {
          ...(startBefore && { start_before: startBefore }),
          limit: 10,
        },
      })
      return [
        ...draftProposals,
        ...proposals,
      ]
    },
})

export const proposal = selectorFamily({
  key: 'ProposalItem',
  get:
    ({
      contractAddress,
      proposalId,
    }: {
      contractAddress: string
      proposalId: string
    }) =>
    async ({ get }) => {
      if (isDraftProposalId(proposalId)) {
        return get(draftProposal(proposalId))
      }
      const client = get(cosmWasmClient)
      const proposalInfo = await client?.queryContractSmart(contractAddress, {
        proposal: { proposal_id: parseInt(proposalId || '0', 10) },
      })
      return proposalInfo
    },
})
