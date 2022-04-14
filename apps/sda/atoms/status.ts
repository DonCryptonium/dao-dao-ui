import { atom } from 'recoil'

import { localStorageEffect } from './localStorageEffect'

export const loadingAtom = atom<boolean>({
  key: 'loading',
  default: false,
})

export const errorAtom = atom<any>({
  key: 'error',
  default: undefined,
})

export const transactionHashAtom = atom<string | undefined>({
  key: 'transactionHash',
  default: undefined,
})

export interface Status {
  status: 'success' | 'error' | 'info'
  title: string
  message?: string
}

export const activeStatusAtom = atom<Status | undefined>({
  key: 'activeStatus',
  default: undefined,
})

export const betaWarningAcceptedAtom = atom<boolean>({
  key: 'betaWarningAccepted',
  default: false,
  effects_UNSTABLE: [localStorageEffect<boolean>('betaWarningAccepted')],
})

export const showBetaNoticeAtom = atom<boolean>({
  key: 'showBetaNotice',
  default: true,
})
