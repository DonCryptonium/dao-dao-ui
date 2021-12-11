import { selectorFamily } from 'recoil'
import { cosmWasmClient } from 'selectors/cosm'

export const proposals = selectorFamily({
  key: 'ProposalList',
  get:
    (contractAddress: string) =>
    async ({ get }) => {
      debugger
      const startBefore: number = 0
      const client = get(cosmWasmClient)
      const { proposals: contracts } = await client?.queryContractSmart(
        contractAddress,
        {
          reverse_proposals: {
            ...(startBefore && { start_before: startBefore }),
            limit: 10,
          },
        }
      )
      const proposalList: any[] = []
      if (contracts) {
        for (let address of contracts) {
          const proposalInfo = await client?.queryContractSmart(address, {
            get_config: {},
          })
          if (proposalInfo?.config) {
            const config = {
              ...proposalInfo.config,
              address,
            }
            proposalList.push(config)
          }
        }
      }
      return proposalList
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
