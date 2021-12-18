import {
  BankMsg,
  Coin,
  CosmosMsgFor_Empty,
  ExecuteMsg,
  WasmMsg,
} from '@dao-dao/types/contracts/cw3-dao'

export function isBankMsg(msg?: CosmosMsgFor_Empty): msg is { bank: BankMsg } {
  return (msg as any).bank !== undefined
}

export function isBurnMsg(msg?: BankMsg): msg is {
  burn: {
    amount: Coin[]
    [k: string]: unknown
  }
} {
  return (msg as any)?.burn !== undefined
}

export function isSendMsg(msg?: BankMsg): msg is {
  send: {
    amount: Coin[]
    to_address: string
    [k: string]: unknown
  }
} {
  return (msg as any)?.send !== undefined
}

export function isWasmMsg(msg?: CosmosMsgFor_Empty): msg is { wasm: WasmMsg } {
  return (msg as any)?.wasm !== undefined
}

export function isExecuteMsg(msg?: any): msg is {
  execute: {
    contract_addr: string
    funds: Coin[]
    msg: any
  }
} {
  return (msg as any)?.execute !== undefined
}

export type MintMsg = {
  wasm: {
    execute: {
      contract_addr: string
      funds: Coin[]
      clear_admin: any
      msg: {
        mint: {
          recipient: string
          amount: string
        }
      }
    }
  }
}

export function isMintMsg(msg: any): msg is MintMsg {
  if (isExecuteMsg(msg)) {
    return msg.execute?.msg?.mint !== undefined
  }
  return false
}
