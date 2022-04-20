/**
 * This file was automatically generated by cosmwasm-typescript-gen.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the cosmwasm-typescript-gen generate command to regenerate this file.
 */

import {
  CosmWasmClient,
  ExecuteResult,
  SigningCosmWasmClient,
} from '@cosmjs/cosmwasm-stargate'

import { CosmosMsgFor_Empty } from './cw-proposal-single'
export interface ConfigResponse {
  automatically_add_cw20s: boolean
  automatically_add_cw721s: boolean
  description: string
  image_url?: string | null
  name: string
  [k: string]: unknown
}
export type Addr = string
export type Uint128 = string
export interface Cw20BalancesResponse {
  addr: Addr
  balance: Uint128
  [k: string]: unknown
}
export type Cw20TokenListResponse = Addr[]
export type Cw721TokenListResponse = Addr[]
export interface DumpStateResponse {
  config: Config
  governance_modules: Addr[]
  version: ContractVersion
  voting_module: Addr
  [k: string]: unknown
}
export interface Config {
  automatically_add_cw20s: boolean
  automatically_add_cw721s: boolean
  description: string
  image_url?: string | null
  name: string
  [k: string]: unknown
}
export interface ContractVersion {
  contract: string
  version: string
  [k: string]: unknown
}
export interface GetItemResponse {
  item?: Addr | null
  [k: string]: unknown
}
export type GovernanceModulesResponse = Addr[]
export interface InfoResponse {
  info: ContractVersion
  [k: string]: unknown
}
export type Admin =
  | {
      address: {
        addr: string
        [k: string]: unknown
      }
    }
  | {
      governance_contract: {
        [k: string]: unknown
      }
    }
  | {
      none: {
        [k: string]: unknown
      }
    }
export type Binary = string
export type InitialItemInfo =
  | {
      Existing: {
        address: string
        [k: string]: unknown
      }
    }
  | {
      Instantiate: {
        info: ModuleInstantiateInfo
        [k: string]: unknown
      }
    }
export interface InstantiateMsg {
  automatically_add_cw20s: boolean
  automatically_add_cw721s: boolean
  description: string
  governance_modules_instantiate_info: ModuleInstantiateInfo[]
  image_url?: string | null
  initial_items?: InitialItem[] | null
  name: string
  voting_module_instantiate_info: ModuleInstantiateInfo
  [k: string]: unknown
}
export interface ModuleInstantiateInfo {
  admin: Admin
  code_id: number
  label: string
  msg: Binary
  [k: string]: unknown
}
export interface InitialItem {
  info: InitialItemInfo
  name: string
  [k: string]: unknown
}
export type ListItemsResponse = string[]
export interface TotalPowerAtHeightResponse {
  height: number
  power: Uint128
  [k: string]: unknown
}
export type VotingModuleResponse = string
export interface VotingPowerAtHeightResponse {
  height: number
  power: Uint128
  [k: string]: unknown
}
export interface ReadOnlyInterface {
  contractAddress: string
  config: () => Promise<ConfigResponse>
  votingModule: () => Promise<VotingModuleResponse>
  governanceModules: ({
    limit,
    startAt,
  }: {
    limit?: number
    startAt?: string
  }) => Promise<GovernanceModulesResponse>
  dumpState: () => Promise<DumpStateResponse>
  getItem: ({ key }: { key: string }) => Promise<GetItemResponse>
  listItems: ({
    limit,
    startAt,
  }: {
    limit?: number
    startAt?: string
  }) => Promise<ListItemsResponse>
  cw20TokenList: ({
    limit,
    startAt,
  }: {
    limit?: number
    startAt?: string
  }) => Promise<Cw20TokenListResponse>
  cw721TokenList: ({
    limit,
    startAt,
  }: {
    limit?: number
    startAt?: string
  }) => Promise<Cw721TokenListResponse>
  cw20Balances: ({
    limit,
    startAt,
  }: {
    limit?: number
    startAt?: string
  }) => Promise<Cw20BalancesResponse>
  votingPowerAtHeight: ({
    address,
    height,
  }: {
    address: string
    height?: number
  }) => Promise<VotingPowerAtHeightResponse>
  totalPowerAtHeight: ({
    height,
  }: {
    height?: number
  }) => Promise<TotalPowerAtHeightResponse>
  info: () => Promise<InfoResponse>
}
export class QueryClient implements ReadOnlyInterface {
  client: CosmWasmClient
  contractAddress: string

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client
    this.contractAddress = contractAddress
    this.config = this.config.bind(this)
    this.votingModule = this.votingModule.bind(this)
    this.governanceModules = this.governanceModules.bind(this)
    this.dumpState = this.dumpState.bind(this)
    this.getItem = this.getItem.bind(this)
    this.listItems = this.listItems.bind(this)
    this.cw20TokenList = this.cw20TokenList.bind(this)
    this.cw721TokenList = this.cw721TokenList.bind(this)
    this.cw20Balances = this.cw20Balances.bind(this)
    this.votingPowerAtHeight = this.votingPowerAtHeight.bind(this)
    this.totalPowerAtHeight = this.totalPowerAtHeight.bind(this)
    this.info = this.info.bind(this)
  }

  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {},
    })
  }
  votingModule = async (): Promise<VotingModuleResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      voting_module: {},
    })
  }
  governanceModules = async ({
    limit,
    startAt,
  }: {
    limit?: number
    startAt?: string
  }): Promise<GovernanceModulesResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      governance_modules: {
        limit,
        start_at: startAt,
      },
    })
  }
  dumpState = async (): Promise<DumpStateResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      dump_state: {},
    })
  }
  getItem = async ({ key }: { key: string }): Promise<GetItemResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_item: {
        key,
      },
    })
  }
  listItems = async ({
    limit,
    startAt,
  }: {
    limit?: number
    startAt?: string
  }): Promise<ListItemsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      list_items: {
        limit,
        start_at: startAt,
      },
    })
  }
  cw20TokenList = async ({
    limit,
    startAt,
  }: {
    limit?: number
    startAt?: string
  }): Promise<Cw20TokenListResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      cw20_token_list: {
        limit,
        start_at: startAt,
      },
    })
  }
  cw721TokenList = async ({
    limit,
    startAt,
  }: {
    limit?: number
    startAt?: string
  }): Promise<Cw721TokenListResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      cw721_token_list: {
        limit,
        start_at: startAt,
      },
    })
  }
  cw20Balances = async ({
    limit,
    startAt,
  }: {
    limit?: number
    startAt?: string
  }): Promise<Cw20BalancesResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      cw20_balances: {
        limit,
        start_at: startAt,
      },
    })
  }
  votingPowerAtHeight = async ({
    address,
    height,
  }: {
    address: string
    height?: number
  }): Promise<VotingPowerAtHeightResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      voting_power_at_height: {
        address,
        height,
      },
    })
  }
  totalPowerAtHeight = async ({
    height,
  }: {
    height?: number
  }): Promise<TotalPowerAtHeightResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      total_power_at_height: {
        height,
      },
    })
  }
  info = async (): Promise<InfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      info: {},
    })
  }
}
export interface Interface extends ReadOnlyInterface {
  contractAddress: string
  sender: string
  executeProposalHook: ({
    msgs,
  }: {
    msgs: CosmosMsgFor_Empty[]
  }) => Promise<ExecuteResult>
  updateConfig: ({ config }: { config: Config }) => Promise<ExecuteResult>
  updateVotingModule: ({
    module,
  }: {
    module: ModuleInstantiateInfo
  }) => Promise<ExecuteResult>
  updateGovernanceModules: ({
    toAdd,
    toRemove,
  }: {
    toAdd: ModuleInstantiateInfo[]
    toRemove: string[]
  }) => Promise<ExecuteResult>
  setItem: ({
    addr,
    key,
  }: {
    addr: string
    key: string
  }) => Promise<ExecuteResult>
  removeItem: ({ key }: { key: string }) => Promise<ExecuteResult>
  receive: () => Promise<ExecuteResult>
  receiveNft: () => Promise<ExecuteResult>
  updateCw20List: ({
    toAdd,
    toRemove,
  }: {
    toAdd: string[]
    toRemove: string[]
  }) => Promise<ExecuteResult>
  updateCw721List: ({
    toAdd,
    toRemove,
  }: {
    toAdd: string[]
    toRemove: string[]
  }) => Promise<ExecuteResult>
}
export class Client extends QueryClient implements Interface {
  client: SigningCosmWasmClient
  sender: string
  contractAddress: string

  constructor(
    client: SigningCosmWasmClient,
    sender: string,
    contractAddress: string
  ) {
    super(client, contractAddress)
    this.client = client
    this.sender = sender
    this.contractAddress = contractAddress
    this.executeProposalHook = this.executeProposalHook.bind(this)
    this.updateConfig = this.updateConfig.bind(this)
    this.updateVotingModule = this.updateVotingModule.bind(this)
    this.updateGovernanceModules = this.updateGovernanceModules.bind(this)
    this.setItem = this.setItem.bind(this)
    this.removeItem = this.removeItem.bind(this)
    this.receive = this.receive.bind(this)
    this.receiveNft = this.receiveNft.bind(this)
    this.updateCw20List = this.updateCw20List.bind(this)
    this.updateCw721List = this.updateCw721List.bind(this)
  }

  executeProposalHook = async ({
    msgs,
  }: {
    msgs: CosmosMsgFor_Empty[]
  }): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        execute_proposal_hook: {
          msgs,
        },
      },
      'auto'
    )
  }
  updateConfig = async ({
    config,
  }: {
    config: Config
  }): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        update_config: {
          config,
        },
      },
      'auto'
    )
  }
  updateVotingModule = async ({
    module,
  }: {
    module: ModuleInstantiateInfo
  }): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        update_voting_module: {
          module,
        },
      },
      'auto'
    )
  }
  updateGovernanceModules = async ({
    toAdd,
    toRemove,
  }: {
    toAdd: ModuleInstantiateInfo[]
    toRemove: string[]
  }): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        update_governance_modules: {
          to_add: toAdd,
          to_remove: toRemove,
        },
      },
      'auto'
    )
  }
  setItem = async ({
    addr,
    key,
  }: {
    addr: string
    key: string
  }): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        set_item: {
          addr,
          key,
        },
      },
      'auto'
    )
  }
  removeItem = async ({ key }: { key: string }): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        remove_item: {
          key,
        },
      },
      'auto'
    )
  }
  receive = async (): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        receive: {},
      },
      'auto'
    )
  }
  receiveNft = async (): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        receive_nft: {},
      },
      'auto'
    )
  }
  updateCw20List = async ({
    toAdd,
    toRemove,
  }: {
    toAdd: string[]
    toRemove: string[]
  }): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        update_cw20_list: {
          to_add: toAdd,
          to_remove: toRemove,
        },
      },
      'auto'
    )
  }
  updateCw721List = async ({
    toAdd,
    toRemove,
  }: {
    toAdd: string[]
    toRemove: string[]
  }): Promise<ExecuteResult> => {
    return await this.client.execute(
      this.sender,
      this.contractAddress,
      {
        update_cw721_list: {
          to_add: toAdd,
          to_remove: toRemove,
        },
      },
      'auto'
    )
  }
}