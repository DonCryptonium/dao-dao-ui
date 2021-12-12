import { selectorFamily } from 'recoil'
import { cosmWasmClient } from 'selectors/cosm'
import { EmptyProposalState } from 'models/proposal/proposal'

export const draftProposal = selectorFamily({
  key: 'ProposalDraft',
  get:
    () =>
    ({ get }) => {
      return {
        ...EmptyProposalState,
        description: 'Draft Proposal',
        id: -1,
      }
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
      const client = get(cosmWasmClient)
      const { proposals } = await client?.queryContractSmart(contractAddress, {
        reverse_proposals: {
          ...(startBefore && { start_before: startBefore }),
          limit: 10,
        },
      })
      return [
        {
          ...EmptyProposalState,
          status: 'Draft',
          description: 'Draft Proposal',
          title: 'Empty Proposal for Testing',
          id: -1,
        },
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
      const client = get(cosmWasmClient)
      const proposalInfo = await client?.queryContractSmart(contractAddress, {
        proposal: { proposal_id: parseInt(proposalId || '0', 10) },
      })
      return proposalInfo
    },
})
