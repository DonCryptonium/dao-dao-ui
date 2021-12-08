import { selector, useRecoilValueLoadable } from 'recoil'
// import { connectKeplr } from 'services/keplr'
// import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { cosmosQueryClient } from './cosmos-selectors'
import { daoContractAddress } from '../atoms/dao-atoms'

// if (signingClient !== undefined) {
//   const startBefore = 0
//   async function loadProposals() {
//     const response = await (signingClient as any).queryContractSmart(
//       contractAddress,
//       {
//         reverse_proposals: {
//           // ...(startBefore && { start_before: startBefore }),
//           limit: 10,
//         },
//       }
//     )
//     setProposals(response.proposals)
//   }
//   loadProposals()
// }

export const daoProposalsQuery = selector({
  key: 'daoProposals',
  get: async ({ get }) => {
    const queryClient = get(cosmosQueryClient)
    const contractAddress = get(daoContractAddress)
    if (!queryClient && contractAddress) {
      return undefined
    }
    // const startBefore = 0
    const response = await queryClient.queryContractSmart(contractAddress, {
      reverse_proposals: {
        // ...(startBefore && { start_before: startBefore }),
        limit: 10,
      },
    })
    return response.proposals
  },
})
