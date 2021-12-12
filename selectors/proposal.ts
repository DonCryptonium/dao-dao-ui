import { selectorFamily } from 'recoil'
import { cosmWasmClient } from 'selectors/cosm'

export const proposals = selectorFamily({
  key: 'ProposalList',
  get:
    ({contractAddress, startBefore}: {contractAddress: string, startBefore: number}) =>
    async ({ get }) => {
      const client = get(cosmWasmClient)
      const { proposals } = await client?.queryContractSmart(
        contractAddress,
        {
          reverse_proposals: {
            ...(startBefore && { start_before: startBefore }),
            limit: 10,
          },
        }
      )
      return proposals
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
