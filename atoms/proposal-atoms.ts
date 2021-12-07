import { atom } from 'recoil'

export const proposalsState = atom<string[]>({
  key: 'proposalsState',
  default: [],
});
