import {
  ProposalResponse,
  ProposalTallyResponse,
  VoteInfo,
} from '@dao-dao/types/contracts/cw3-dao'
import { selectorFamily } from 'recoil'
import { cosmWasmClient } from './cosm'
import { proposalsRequestIdAtom } from 'atoms/proposals'

export const onChainProposalsSelector = selectorFamily<ProposalResponse[], any>(
  {
    key: 'onChainProposals',
    get:
      ({
        contractAddress,
        startBefore,
        limit,
      }: {
        contractAddress: string
        startBefore: number
        limit: number
      }) =>
      async ({ get }) => {
        const requestId = get(proposalsRequestIdAtom)
        console.log(`fetching proposals, requestId: ${requestId}`)
        const client = get(cosmWasmClient)
        const { proposals } = await client.queryContractSmart(contractAddress, {
          reverse_proposals: {
            ...(startBefore && { start_before: startBefore }),
            limit: limit,
          },
        })
        return proposals
      },
  }
)

export const proposalSelector = selectorFamily<
  ProposalResponse,
  { contractAddress: string; proposalId: number }
>({
  key: 'proposalSelector',
  get:
    ({
      contractAddress,
      proposalId,
    }: {
      contractAddress: string
      proposalId: number
    }) =>
    async ({ get }) => {
      const client = get(cosmWasmClient)
      const proposal = await client.queryContractSmart(contractAddress, {
        proposal: { proposal_id: proposalId },
      })
      return proposal
    },
})

export const proposalVotesSelector = selectorFamily<
  VoteInfo[],
  { contractAddress: string; proposalId: number }
>({
  key: 'proposalVotesSelector',
  get:
    ({
      contractAddress,
      proposalId,
    }: {
      contractAddress: string
      proposalId: number
    }) =>
    async ({ get }) => {
      const client = get(cosmWasmClient)
      const votes = await client.queryContractSmart(contractAddress, {
        list_votes: { proposal_id: proposalId },
      })
      return votes.votes
    },
})

export const proposalTallySelector = selectorFamily<
  ProposalTallyResponse,
  { contractAddress: string; proposalId: number }
>({
  key: 'proposalTallySelector',
  get:
    ({
      contractAddress,
      proposalId,
    }: {
      contractAddress: string
      proposalId: number
    }) =>
    async ({ get }) => {
      const client = get(cosmWasmClient)
      const tally = await client.queryContractSmart(contractAddress, {
        tally: { proposal_id: proposalId },
      })
      return tally
    },
})
