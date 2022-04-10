import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { StargateClient } from '@cosmjs/stargate'

type ChainClientRoutes<T> = {
  [rpcEndpoint: string]: T
}

type HandleConnect<T> = (rpcEndpoint: string) => Promise<T>

/*
 * This is a helper class to connect to a chain and return a client.
 * This is needed to avoid connecting to a chain multiple times.
 *
 * @example
 * export const stargateClientRouter = new ChainClientRouter({
 *   handleConnect: (rpcEndpoint: string) => StargateClient.connect(rpcEndpoint),
 * })
 *
 * const client = await stargateClientRouter.connect(RPC_ENDPOINT);
 *
 * const queryResponse = await client.queryContractSmart(...);
 *  */
class ChainClientRouter<T> {
  private readonly handleConnect: HandleConnect<T>
  private instances: ChainClientRoutes<T> = {}

  constructor({ handleConnect }: { handleConnect: HandleConnect<T> }) {
    this.handleConnect = handleConnect
  }

  async connect(rpcEndpoint: string) {
    if (this.getClientInstance(rpcEndpoint)) {
      return this.getClientInstance(rpcEndpoint)
    }

    this.setClientInstance(rpcEndpoint, await this.handleConnect(rpcEndpoint))

    return this.getClientInstance(rpcEndpoint)
  }

  private getClientInstance(rpcEndpoint: string) {
    return this.instances[rpcEndpoint]
  }

  private setClientInstance(rpcEndpoint: string, client: T) {
    this.instances[rpcEndpoint] = client
  }
}

/*
 * Router for connecting to `CosmWasmClient`.
 *  */
export const cosmWasmClientRouter = new ChainClientRouter({
  handleConnect: (rpcEndpoint: string) => CosmWasmClient.connect(rpcEndpoint),
})

/*
 * Router for connecting to `StargateClient`.
 *  */
export const stargateClientRouter = new ChainClientRouter({
  handleConnect: (rpcEndpoint: string) => StargateClient.connect(rpcEndpoint),
})
