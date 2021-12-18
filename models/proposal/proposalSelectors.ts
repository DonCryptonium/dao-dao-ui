import {
  BankMsg,
  Coin,
  Uint128,
  Proposal,
  ProposalResponse,
} from '@dao-dao/types/contracts/cw3-dao'
import { ExecuteMsg as MintExecuteMsg } from '@dao-dao/types/contracts/cw20-gov'
import {
  MessageMap,
  MessageMapEntry,
  ProposalMessageType,
  messageSort,
} from './messageMap'
import { makeExecutableMintMessage } from '../../util/messagehelpers'
import {
  convertDenomToContractReadableDenom,
  convertDenomToMicroDenom,
} from '../../util/conversion'
import { isBankMsg, isBurnMsg, isSendMsg, MintMsg } from 'selectors/message'

function convertToMicroAmounts(amounts: Coin[]) {
  for (const coin of amounts) {
    coin.amount = convertDenomToMicroDenom(coin.amount)
    coin.denom = convertDenomToContractReadableDenom(coin.denom)
  }
}

/// If there's no active ID, this is the first one
/// for a given message type.
// export function topmostId(
//   proposal: Proposal,
//   messageType?: ProposalMessageType
// ): string | undefined {
//   const messages = proposalMessages(proposal, messageType)
//   if (messages?.length) {
//     return messages[0].id
//   }
//   return undefined
// }

export function getMessage(
  proposal: Proposal,
  messageId: string
): MessageMapEntry | undefined {
  // return proposal.messageMap[messageId]
  return undefined
}

export function getActiveMessageId(proposal: Proposal): string {
  // return proposal.activeMessageId
  return ''
}

export function getSpendAmount(spendMsg?: BankMsg): Uint128 | undefined {
  if (isSendMsg(spendMsg)) {
    const coins = spendMsg.send?.amount as Coin[]
    if (coins?.length) {
      return coins[0]?.amount
    }
  }
  return undefined
}

export function getSpendRecipient(spendMsg?: BankMsg): string | undefined {
  if (isSendMsg(spendMsg)) {
    const send = spendMsg.send
    if (send) {
      return send?.to_address
    }
  }
  return undefined
}

export function getMintRecipient(mintMsg?: MintMsg) {
  return mintMsg?.wasm?.execute?.msg?.mint?.recipient
}

export function getMintAmount(mintMessage?: MintMsg): Uint128 | undefined {
  return mintMessage?.wasm?.execute?.msg?.mint?.amount
}

export function proposalMessages(
  proposal: Proposal | ProposalResponse,
  messageType?: ProposalMessageType // Optional filter
) {
  // return sortedMessages(proposal.messageMap, messageType)
  return proposal.msgs
}

export function sortedMessages(
  messageMap: MessageMap,
  messageType?: ProposalMessageType
): MessageMapEntry[] {
  const messages = Object.values(messageMap).map((mapEntry) => {
    if (messageType && mapEntry.messageType == messageType) {
      return mapEntry
    }
    return mapEntry
  })
  messages.sort(messageSort)
  return messages
}
