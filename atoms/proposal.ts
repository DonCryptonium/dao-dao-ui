import { atom, AtomEffect } from 'recoil'

import { DraftProposal } from 'models/proposal/proposal'

export const DRAFT_SIGIL = '_'

export type DraftProposalMap = {
  [key: string]: DraftProposal
}

const localStorageEffect: (key: string) => AtomEffect<DraftProposalMap> =
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

export const draftProposalMap = atom<DraftProposalMap>({
  key: 'DraftProposalMap',
  default: {},
  effects_UNSTABLE: [localStorageEffect('draftProposalMap')],
})

export const nextDraftProposalId = atom<number>({
  key: 'NextDraftProposalId',
  default: 1,
})

// type SetSelfType = (
//   | T
//   | DefaultValue
//   | Promise<T | DefaultValue> // Only allowed for initialization at this time
//   | ((T | DefaultValue) => T | DefaultValue),
// ) => void
