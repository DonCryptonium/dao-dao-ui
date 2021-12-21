import { atom} from 'recoil'

export const loading = atom<boolean>({
  key: 'Loading',
  default: false
})

export const error = atom<any>({
  key: 'Error',
  default: undefined
})

export const transactionHash = atom<string | undefined>({
  key: 'TransactionHash',
  default: undefined
})

export interface Status {
  status: 'success' | 'error' | 'info'
  title: string
  message?: string
}

export const activeStatus = atom<Status | undefined>({
  key: 'ActiveStatus',
  default: undefined
})
