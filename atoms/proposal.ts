import { atom, AtomEffect } from 'recoil'

import { Proposal } from '@dao-dao/types/contracts/cw3-dao'

export const DRAFT_SIGIL = '_'


export interface ProposalKey {
  contractAddress: string
  proposalId: number
}

export interface ProposalMapItem {
  proposal: Proposal
  draft: boolean
}

export type ProposalMap = Map<ProposalKey, ProposalMapItem>

const localStorageEffect: <T> (key: string) => AtomEffect<T> =
  (key) =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key)
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue))
    }

    onSet((newValue: any, _: any, isReset: boolean) => {
      isReset
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, JSON.stringify(newValue))
    })
  }

export const proposalMap = atom<ProposalMap>({
  key: 'ProposalMap',
  default: new Map<ProposalKey, ProposalMapItem>(),
  effects_UNSTABLE: [localStorageEffect<ProposalMap>('proposalMap')],
})
