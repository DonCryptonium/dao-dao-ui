import { selectorFamily, selector, useRecoilState } from 'recoil'
import { cosmWasmClient } from 'selectors/cosm'
import {
  // DRAFT_SIGIL,
  // draftProposalMap,
  proposalMap as proposalMapAtom,
  ProposalKey,
  ProposalMapItem,
} from 'atoms/proposal'
import { Proposal } from '@dao-dao/types/contracts/cw3-dao'

// export function isDraftProposalId(proposalId: string): boolean {
//   if (!proposalId?.length) {
//     return true
//   }
//   return proposalId[0] === DRAFT_SIGIL
// }

export const nextDraftProposalIdSelector = selector<number>({
  key: 'NextDraftProposalId',
  get: ({ get }) => {
    const map = get(proposalMapAtom)
    return map.size
  },
})

// export const draftProposal = selectorFamily({
//   key: 'ProposalDraft',
//   get:
//     (proposalId: string) =>
//     ({ get }) => {
//       const draftMap = get(draftProposalMap)
//       return draftMap[proposalId]
//     },
// })

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
      const proposalMap = get(proposalMapAtom)
      const client = get(cosmWasmClient)
      const { proposals } = await client?.queryContractSmart(contractAddress, {
        reverse_proposals: {
          ...(startBefore && { start_before: startBefore }),
          limit: 10,
        },
      })
      return [
        ...proposalMap.values(),
        ...proposals.map((proposal: Proposal) => {
          return { proposal, draft: false }
        }),
      ]
    },
})

export const proposal = selectorFamily<
  ProposalMapItem,
  { contractAddress: string; proposalId: number }
>({
  key: 'ProposalItem',
  get:
    (proposalKey: ProposalKey) =>
    async ({ get }) => {
      const proposalMap = get(proposalMapAtom)
      const proposalItem = proposalMap.get(proposalKey)
      if (proposalItem) {
        return proposalItem
      }
      const client = get(cosmWasmClient)
      const proposalInfo = await client?.queryContractSmart(
        proposalKey.contractAddress,
        {
          proposal: { proposal_id: proposalKey.proposalId },
        }
      )
      const nonDraftItem: ProposalMapItem = {
        proposal: proposalInfo,
        draft: false,
      }
      return nonDraftItem
    },
})
