import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useEffect, useState } from 'react'
import {
  ProposalListResponse,
  ProposalResponse,
  ProposalTallyResponse,
  ThresholdResponse,
  VoteInfo,
} from '@dao-dao/types/contracts/cw3-dao'
import { useSigningClient } from 'contexts/cosmwasm'
import { memoForProposal, Proposal } from 'models/proposal/proposal'
import { messageForProposal } from 'models/proposal/proposalSelectors'
import { defaultExecuteFee } from 'util/fee'

// Returns a list of proposals and pagination methods
export function useProposals(contractAddress: string) {
  const { walletAddress, signingClient } = useSigningClient()
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)
  const [proposals, setProposals] = useState<ProposalResponse[]>([])
  const [hideLoadMore, setHideLoadMore] = useState(false)
  const [startBefore, setStartBefore] = useState<number | null>(null)

  useEffect(() => {
    if (walletAddress.length === 0 || !signingClient) {
      setProposals([])
      setHideLoadMore(false)
      return
    }

    setLoading(true)
    async function sign(signingClient: SigningCosmWasmClient) {
      try {
        const response: ProposalListResponse =
          await signingClient.queryContractSmart(contractAddress, {
            reverse_proposals: {
              ...(startBefore && { start_before: startBefore }),
              limit: 10,
            },
          })
        setLoading(false)
        if (response.proposals.length < 10) {
          setHideLoadMore(true)
        }
        setProposals((p) => p.concat(response.proposals))
      } catch (err) {
        setError(err as Error)
        setLoading(false)
      }
    }
    sign(signingClient)
  }, [walletAddress, signingClient, startBefore, contractAddress])
  return { proposals, hideLoadMore, loading, error, setStartBefore }
}

// Returns proposal info and associated contract methods
export function useProposal(contractAddress: string, proposalId: string) {
  const { walletAddress, signingClient } = useSigningClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [votes, setVotes] = useState<VoteInfo[]>([])
  const [tally, setTally] = useState<ProposalTallyResponse>()
  const [proposal, setProposal] = useState<ProposalResponse | null>(null)
  const [timestamp, setTimestamp] = useState(new Date())
  const [transactionHash, setTransactionHash] = useState('')

  useEffect(() => {
    if (!signingClient) {
      return
    }
    setLoading(true)
    Promise.all([
      signingClient.queryContractSmart(contractAddress, {
        proposal: { proposal_id: parseInt(proposalId) },
      }),
      signingClient.queryContractSmart(contractAddress, {
        list_votes: { proposal_id: parseInt(proposalId) },
      }),
      signingClient.queryContractSmart(contractAddress, {
        tally: { proposal_id: parseInt(proposalId) },
      }),
    ])
      .then((values) => {
        const [proposal, { votes }, tally] = values
        setProposal(proposal)
        setVotes(votes)
        setTally(tally)
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
        setError(err.message)
      })
  }, [walletAddress, signingClient, proposalId, timestamp, contractAddress])

  const vote = async (vote: string) => {
    setError('')
    signingClient
      ?.execute(
        walletAddress,
        contractAddress,
        {
          vote: { proposal_id: parseInt(proposalId), vote },
        },
        defaultExecuteFee
      )
      .then((response) => {
        setTimestamp(new Date())
        setTransactionHash(response.transactionHash)
      })
      .catch((err) => {
        setLoading(false)
        setError(err.message)
      })
  }

  const execute = async () => {
    setError('')
    signingClient
      ?.execute(
        walletAddress,
        contractAddress,
        {
          execute: { proposal_id: parseInt(proposalId) },
        },
        defaultExecuteFee
      )
      .then((response) => {
        setTimestamp(new Date())
        setTransactionHash(response.transactionHash)
      })
      .catch((err) => {
        setLoading(false)
        setError(err.message)
      })
  }

  const close = async () => {
    setError('')
    signingClient
      ?.execute(
        walletAddress,
        contractAddress,
        {
          close: { proposal_id: parseInt(proposalId) },
        },
        defaultExecuteFee
      )
      .then((response) => {
        setTimestamp(new Date())
        setTransactionHash(response.transactionHash)
      })
      .catch((err) => {
        setLoading(false)
        setError(err.message)
      })
  }

  return {
    walletAddress,
    loading,
    error,
    proposal,
    votes,
    transactionHash,
    vote,
    execute,
    close,
    tally,
  }
}

// Returns an excute method used to create a proposal
// When a proposal is created, it returns a proposalID
export function useCreateProposal(contractAddress: string) {
  const { walletAddress, signingClient } = useSigningClient()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [proposalID, setProposalID] = useState('')

  const execute = async (proposal: Proposal) => {
    if (!signingClient) {
      setError('Please connect your wallet')
      return
    }

    setLoading(true)
    setError('')

    const propose = messageForProposal(proposal, contractAddress)
    const memo = memoForProposal(proposal)

    try {
      const response = await signingClient?.execute(
        walletAddress,
        contractAddress,
        { propose },
        defaultExecuteFee,
        memo
      )
      setLoading(false)
      if (response) {
        // setTransactionHash(response.transactionHash)
        const [{ events }] = response.logs
        const [wasm] = events.filter((e) => e.type === 'wasm')
        const [{ value }] = wasm.attributes.filter(
          (attr) => attr.key === 'proposal_id'
        )
        setProposalID(value)
        return response
      }
    } catch (e: any) {
      console.error(
        `Error submitting proposal ${JSON.stringify(proposal, undefined, 2)}`
      )
      console.dir(e)
      console.error(e.message)
      setLoading(false)
      setError(e.message)
    }
  }

  return { walletAddress, loading, error, proposalID, execute }
}
