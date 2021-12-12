// Client-side proposal representation
import {
  CosmosMsgFor_Empty,
  ExecuteMsg,
} from '@dao-dao/types/contracts/cw3-dao'
import { ExecuteMsg as DAOExecuteMsg } from '@dao-dao/types/contracts/cw20-gov'
import {
  Proposal as ProposalState,
  Status,
  Threshold,
  Vote,
  Votes,
} from '@dao-dao/types/contracts/cw3-dao'

import { labelForMessage } from '../../util/messagehelpers'
import { MessageMap } from './messageMap'

export const MEMO_MAX_LEN = 255

export interface DraftProposal {
  title: string
  description: string
  messageMap: MessageMap
  nextId: number
  // Which message is currently selected
  activeMessageId: string
  pendingMessages: {
    [key: string]: CosmosMsgFor_Empty | ExecuteMsg | DAOExecuteMsg
  }
}

export const EmptyProposal: DraftProposal = {
  title: '',
  description: '',
  nextId: 0,
  messageMap: {},
  activeMessageId: '',
  pendingMessages: {},
}

const EmptyThreshold: Threshold = {
  threshold_quorum: {
    quorum: '0',
    threshold: '0',
  },
}

const EmptyVotes: Votes = {
  abstain: '',
  yes: '',
  no: '',
  veto: '',
}

export const EmptyProposalState: ProposalState = {
  title: '',
  description: '',
  expires: {
    at_time: `${new Date()}`,
  },
  deposit: '',
  msgs: [],
  proposer: '',
  start_height: 0,
  status: 'open',
  threshold: { ...EmptyThreshold },
  total_weight: '',
  votes: { ...EmptyVotes },
}

export function memoForProposal(proposal: DraftProposal): string {
  const messagesMemo = Object.values(proposal.messageMap)
    .map((msg) => labelForMessage(msg.message))
    .join(', ')
  return `${proposal.title}\n${proposal.description}\n\n${messagesMemo}`.slice(
    0,
    MEMO_MAX_LEN
  )
}
