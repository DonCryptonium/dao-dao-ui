import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from '@cosmjs/cosmwasm-stargate'
import { OfflineSigner } from '@cosmjs/launchpad'
import { StargateClient } from '@cosmjs/stargate'
import { atomFamily, selectorFamily } from 'recoil'
import { connectKeplr } from 'services/keplr'

const CHAIN_RPC_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || ''
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

export const stargateClient = atomFamily({
  key: 'StargateClient',
  default: () => {
    return StargateClient.connect(CHAIN_RPC_ENDPOINT)
  },
})

export const cosmWasmClient = atomFamily({
  key: 'CosmWasmClient',
  default: () => {
    return CosmWasmClient.connect(CHAIN_RPC_ENDPOINT)
  },
})

export const kelprOfflineSigner = atomFamily({
  key: 'KeplrOfflineSigner',
  default: async (): Promise<OfflineSigner> => {
    await connectKeplr()

    // enable website to access kepler
    await (window as any).keplr.enable(CHAIN_ID)

    // get offline signer for signing txs
    return (window as any).getOfflineSigner(CHAIN_ID)
  },
})

export const cosmWasmSigningClient = atomFamily({
  key: 'SigningCosmWasmClient',
  default: selectorFamily({
    key: 'SigningCosmWasmDefault',
    get:
      (_?: any) =>
      async ({ get }): Promise<SigningCosmWasmClient> => {
        const offlineSigner = get(kelprOfflineSigner(undefined))
        const client: SigningCosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
          CHAIN_RPC_ENDPOINT,
          offlineSigner
        )
        await client.getChainId()
        return client
      },
  }),
})

export const walletAddress = atomFamily({
  key: 'WalletAddress',
  default: selectorFamily({
    key: 'WalletAddressDefault',
    get:
      (_?: any) =>
      async ({ get }): Promise<string> => {
        const offlineSigner = get(kelprOfflineSigner(undefined))
        const [{ address }] = await offlineSigner.getAccounts()
        return address
      },
  }),
})
