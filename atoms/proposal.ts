import { atom } from 'recoil'

import { DraftProposal } from 'models/proposal/proposal'

export const DRAFT_SIGIL = '_'

function draftProposalId(nextId: number): string {
  return `${DRAFT_SIGIL}:${nextId}`
}

export type DraftProposalMap = {
  [key: string]: DraftProposal
}

export const draftProposalMap = atom<DraftProposalMap>({
  key: 'DraftProposalMap',
  default: {},
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

const localStorageEffect =
  (key: string) =>
  ({ setSelf, onSet }: { setSelf: any; onSet: any }) => {
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
