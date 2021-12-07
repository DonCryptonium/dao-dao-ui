import { selector } from "recoil";
import { connectKeplr } from 'services/keplr'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'

const PUBLIC_RPC_ENDPOINT = process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || ''
const PUBLIC_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID

async function loadClient() {
  try {
    await connectKeplr()

    // enable website to access kepler
    await (window as any).keplr.enable(PUBLIC_CHAIN_ID)

    // get offline signer for signing txs
    const offlineSigner = await (window as any).getOfflineSigner(
      PUBLIC_CHAIN_ID
    )

    // make client
    return SigningCosmWasmClient.connectWithSigner(
      PUBLIC_RPC_ENDPOINT,
      offlineSigner
    )
  } catch (e) {
    console.error(e)
  }
}

export const cosmosSigningClient = selector({
  key: 'cosmosSigningClientKey',
  get: loadClient
});
