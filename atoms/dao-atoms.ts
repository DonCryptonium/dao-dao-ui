import { atom } from 'recoil'

export const daoContractAddress = atom<string>({
  key: 'daoContractAddressKey',
  default: '',
});
