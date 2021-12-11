import { DaoListType } from 'hooks/dao'
import { selector, selectorFamily } from 'recoil'
import {
  stargateClient,
  cosmWasmClient,
  kelprOfflineSigner,
} from 'selectors/cosm'

export const daos = selectorFamily({
  key: 'DaoList',
  get: (codeId: number) => async ({ get }) => {
      const client = get(cosmWasmClient)
      let contracts = await client?.getContracts(codeId)
      const daoList: DaoListType[] = []
      if (contracts) {
        for (let address of contracts) {
          const daoInfo = await client?.queryContractSmart(address, {
            get_config: {},
          })
          if (daoInfo?.config) {
            const config: DaoListType = {
              ...daoInfo.config,
              address,
            }
            daoList.push(config)
          }
        }
      }
      return daoList
    },
})

export const dao = selectorFamily({
  key: 'DaoItem',
  get: (contractAddress: string) => async ({get}) => {
    const client = get(cosmWasmClient)
    const daoInfo = await client?.queryContractSmart(contractAddress, {
      get_config: {},
    })
    return daoInfo
  },
})