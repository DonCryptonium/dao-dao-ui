import { Proposal, ProposalResponse } from '@dao-dao/types/contracts/cw3-dao'
import { cosmWasmClient } from 'atoms/cosm'
import {
  atom,
  AtomEffect,
  atomFamily,
  RecoilState,
  selectorFamily,
} from 'recoil'

export type ProposalKey = {
  contractAddress: string
  proposalId: number
}

export interface ProposalMapItem {
  proposal: Proposal | ProposalResponse
  id: number
  activeMessageIndex?: number
  draft: boolean
}

// Maps from a proposal id (a stringified number)
// to a ProposalMapItem
export type ProposalMap = {
  [key: string]: ProposalMapItem
}

// Maps from a contract address to a map of its draft
// proposals
export type ContractProposalMap = {
  [key: string]: ProposalMap
}

export function makeProposalKeyString({
  contractAddress,
  proposalId,
}: ProposalKey): string {
  return `${contractAddress},${proposalId}`
}

export function parseProposalKeyString(
  keyString: string
): ProposalKey | undefined {
  const [contractAddress, proposalIdString] = keyString.split(',')
  const proposalId = parseInt(proposalIdString ?? '-1', 10)
  return {
    contractAddress,
    proposalId,
  }
}

export function draftProposalItem(
  proposal: Proposal,
  id: number
): ProposalMapItem {
  return {
    proposal,
    id,
    draft: true,
  }
}

export function nondraftProposalItem(
  proposal: ProposalResponse
): ProposalMapItem {
  return {
    proposal,
    id: proposal.id,
    draft: false,
  }
}

const localStorageEffect: <T>(key: string) => AtomEffect<T> =
  (key) =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key)
    if (savedValue != null) {
      const json = JSON.parse(savedValue)
      setSelf(json)
    }

    onSet((newValue: any, _: any, isReset: boolean) => {
      if (isReset) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify(newValue))
      }
    })
  }

export const proposalsRequestIdAtom = atom<number>({
  key: 'proposalsRequestIdAtom',
  default: 0
})

export const contractProposalMap = atom<ContractProposalMap>({
  key: 'ContractProposalMap',
  default: {},
  effects_UNSTABLE: [
    localStorageEffect<ContractProposalMap>('contractProposalMap'),
  ],
})

export const proposalMap = atomFamily({
  key: 'ProposalMap',
  default: selectorFamily({
    key: 'ProposalMapDefault',
    get:
      (contractAddress: string) =>
      ({ get }) => {
        const proposals = get(contractProposalMap)
        return proposals[contractAddress]
      },
  }),
  effects_UNSTABLE: [localStorageEffect<ProposalMap>('proposalMap')],
})

export const nextDraftProposalId = atom<number>({
  key: 'NextDraftProposalId',
  default: 10000,
  effects_UNSTABLE: [localStorageEffect<number>('nextDraftProposalId')],
})

export const onChainProposals = atomFamily<ProposalMapItem[], any>({
  key: 'ProposalListOnChain',
  default: selectorFamily({
    key: 'ProposalListOnChainDefault',
    get:
      ({
        contractAddress,
        startBefore,
        requestId, // Forces re-query
      }: {
        contractAddress: string
        startBefore: number,
        requestId: number
      }) =>
      async ({ get }) => {
        console.log(`fetching proposals, requestId: ${requestId}`)
        const client = get(cosmWasmClient(undefined))
        const { proposals } = await client.queryContractSmart(contractAddress, {
          reverse_proposals: {
            ...(startBefore && { start_before: startBefore }),
            limit: 10,
          },
        })
        return [
          ...proposals.map((proposal: ProposalResponse) => {
            return nondraftProposalItem(proposal)
          }),
        ]
      },
  }),
})

export const proposals = atomFamily({
  key: 'ProposalList',
  default: selectorFamily({
    key: 'ProposalListDefault',
    get:
      ({
        contractAddress,
        startBefore,
        requestId
      }: {
        contractAddress: string
        startBefore: number
        requestId: number
      }) =>
      async ({ get }) => {
        // get(proposalsRequestIdAtom)
        const draft = Object.values(get(draftProposals(contractAddress)) ?? {})
        draft.sort((a, b) => a.id > b.id ? -1 : b.id > a.id ? 1 : 0 )
        const onChain = get(onChainProposals({ contractAddress, startBefore, requestId }))
        const combined = [...draft, ...onChain]
        return combined
      },
  }),
})

export const draftProposals = atomFamily<ProposalMap, string>({
  key: 'DraftProposals',
  default: selectorFamily({
    key: 'DraftProposalsDefault',
    get:
      (contractAddress) =>
      ({ get }) => {
        return get(proposalMap(contractAddress))
      },
  }),
})

export const draftProposal = atomFamily<ProposalMapItem | undefined, ProposalKey>({
  key: 'DraftProposal',
  default: selectorFamily({
    key: 'DraftProposalDefault',
    get:
      ({contractAddress, proposalId}) =>
      ({ get }) => {
        const draftProposals = get(proposalMap(contractAddress))
        return draftProposals ? draftProposals[proposalId] : undefined
      },
  }),
})

export const proposal = atomFamily<ProposalMapItem | undefined, ProposalKey>({
  key: 'ProposalItem',
  default: selectorFamily({
    key: 'ProposalItemDefault',
    get:
      ({ contractAddress, proposalId }) =>
      async ({ get }) => {
        const draftProposalItem = get(draftProposal({ contractAddress, proposalId }))
        if (draftProposalItem) {
          return draftProposalItem
        }
        const client = get(cosmWasmClient(undefined))
        try {
        const proposalItemResponse: ProposalResponse =
          await client.queryContractSmart(contractAddress, {
            proposal: { proposal_id: proposalId },
          })
        return nondraftProposalItem(proposalItemResponse)
        } catch (e) {
          console.error(e)
          return undefined
        }
      },
  }),
})
