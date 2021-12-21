import { CosmosMsgFor_Empty, Proposal } from '@dao-dao/types/contracts/cw3-dao'
import { walletAddress } from 'atoms/cosm'
import {
  draftProposalItem,
  makeProposalKeyString,
  nextDraftProposalId,
  proposalMap as proposalMapAtom,
  ProposalMapItem,
  proposals as proposalList,
  proposal as proposalAtom,
  draftProposal as draftProposalAtom,
  contractProposalMap as contractProposalMapAtom,
  draftProposals as draftProposalsAtom,
  nextProposalRequestId as nextProposalRequestIdAtom,
  onChainProposals,
} from 'atoms/proposal'
import HelpTooltip from 'components/HelpTooltip'
import { useThemeContext } from 'contexts/theme'
import { EmptyProposal, EmptyProposalItem } from 'models/proposal/proposal'
import { proposalMessages } from 'models/proposal/proposalSelectors'
import { useRouter } from 'next/router'
import { ChangeEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  useRecoilState,
  useRecoilTransaction_UNSTABLE,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from 'recoil'
import { isBankMsg, isBurnMsg, isMintMsg, isSendMsg } from 'selectors/message'
import {
  labelForMessage,
  makeMintMessage,
  makeSpendMessage,
} from 'util/messagehelpers'
import { createProposalTransaction, isProposal } from 'util/proposal'
import InputField, {
  InputFieldLabel,
  makeFieldErrorMessage,
} from './InputField'
import LineAlert from './LineAlert'
import MessageSelector from './MessageSelector'
import MintEditor from './MintEditor'
import ProposalList from './ProposalList'
import RawEditor from './RawEditor'
import SpendEditor from './SpendEditor'
import {
  cosmWasmSigningClient as cosmWasmSigningClientAtom,
  walletAddress as walletAddressAtom,
} from 'atoms/cosm'

export default function ProposalEditor({
  proposalId,
  loading,
  error,
  onProposal,
  contractAddress,
  recipientAddress,
}: {
  proposalId: number
  loading?: boolean
  error?: string
  onProposal?: (proposal: Proposal) => void
  contractAddress: string
  recipientAddress: string
}) {
  const requestId = useRecoilValue(nextProposalRequestIdAtom)
  const proposals = useRecoilValue(
    proposalList({ contractAddress, startBefore: 0, requestId })
  )
  const [editProposalJson, setEditProposalJson] = useState(false)
  const [proposalDescriptionErrorMessage, setProposalDescriptionErrorMessage] =
    useState('')
  const themeContext = useThemeContext()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const router = useRouter()
  const [contractProposalMap, setContractProposalMap] = useRecoilState(
    contractProposalMapAtom
  )
  const draftProposals = useRecoilValue(draftProposalsAtom(contractAddress))
  const [proposalMapItem, setProposalMapItem] = useRecoilState(
    draftProposalAtom({ contractAddress, proposalId })
  )
  const [nextProposalRequestId, setNextProposalRequestId] = useRecoilState(
    nextProposalRequestIdAtom
  )
  const resetProposals = useResetRecoilState(
    proposalList({ contractAddress, startBefore: 0, requestId })
  )
  const [nextDraftProposalId, setNextDraftProposalId] = useRecoilState(
    nextProposalRequestIdAtom
  )
  const walletAddress = useRecoilValue(walletAddressAtom(undefined))
  const signingClient = useRecoilValue(cosmWasmSigningClientAtom(undefined))
  const createProposalFunction = useRecoilTransaction_UNSTABLE(
    createProposalTransaction({
      walletAddress,
      signingClient,
      contractAddress,
      draftProposals
    }),
    [walletAddress, signingClient, contractAddress, draftProposals]
  )

  const proposalsListRoute = `/dao/${contractAddress}/proposals`

  const proposal: Proposal =
    proposalMapItem?.proposal && isProposal(proposalMapItem?.proposal)
      ? proposalMapItem.proposal
      : { ...EmptyProposal }

  if (!proposalMapItem?.proposal) {
    // We're creating a new proposal, so bump the draft ID:
    setNextDraftProposalId(proposalId)
  }

  const createProposal = (proposal: Proposal) => {
    createProposalFunction(proposalId, proposal)
  }

  const saveDraftProposal = (draftProposal: Proposal) => {
    setContractProposalMap({
      ...contractProposalMap,
      [contractAddress]: {
        ...draftProposals,
        [proposalId + '']: {
          ...(proposalMapItem ?? draftProposalItem(draftProposal, proposalId)),
          proposal: draftProposal,
        },
      },
    })
  }

  const deleteDraftProposal = () => {
    const updatedProposals = { ...draftProposals }
    delete updatedProposals[proposalId + '']
    const updatedMap = {
      ...contractProposalMap,
      [contractAddress]: updatedProposals,
    }
    setContractProposalMap(updatedMap)
  }

  const messageActions = [
    {
      label: 'Spend',
      id: 'spend',
      execute: () => addSpendMessage(),
      href: '#',
      isEnabled: () => true,
    },
    {
      label: 'Wasm',
      id: 'wasm',
      execute: () => addWasmMessage(),
      href: '#',
      isEnabled: () => true,
    },
    {
      label: 'Custom',
      id: 'custom',
      execute: () => addCustomMessage(),
      href: '#',
      isEnabled: () => true,
    },
    {
      label: 'Mint',
      id: 'mint',
      execute: () => addMintMessage(),
      href: '#',
      isEnabled: () => true,
    },
  ]

  const complete = false

  function isProposalValid(proposalToCheck: Proposal): boolean {
    if (!proposalToCheck) {
      return false
    }
    if (!(proposalToCheck.description && proposalToCheck.title)) {
      return false
    }
    return true
  }

  async function onSubmit(_formData: any) {
    // We don't actually care about what the form processor returned in this
    // case, just that the proposal is filled out correctly, which if
    // the submit method gets called it will be.
    if (isProposal(proposal)) {
      if (isProposalValid(proposal)) {
        await createProposal(proposal)
        setNextProposalRequestId(nextProposalRequestId + 1)
        resetProposals()
        deleteDraftProposal()
      }
    }
  }

  function updateProposal(updatedProposal: Proposal) {
    console.log(`updateProposal for ${proposalId}`)
    const updatedProposalItem = {
      ...(proposalMapItem ?? EmptyProposalItem),
      id: proposalId,
      proposal: updatedProposal,
    }
    setProposalMapItem(updatedProposalItem)
    const proposalIdKey = `${proposalId}`
    // const bumpNextId = !draftProposals || !draftProposals[proposalIdKey]
    setContractProposalMap({
      ...contractProposalMap,
      [contractAddress]: {
        ...draftProposals,
        [proposalIdKey]: updatedProposalItem,
      },
    })
    // if (bumpNextId) {
    //   setNextProposalId(proposalId + 1)
    // }
  }

  function setProposalTitle(title: string) {
    updateProposal({
      ...proposal,
      title,
    })
  }

  function setProposalDescription(description: string) {
    updateProposal({
      ...proposal,
      description,
    })
    if (description) {
      setProposalDescriptionErrorMessage('')
    } else {
      setProposalDescriptionErrorMessage('Proposal description required')
    }
  }

  let messages = proposalMessages(proposal).map((msg, messageIndex) => {
    const label = labelForMessage(msg)

    let modeEditor = null
    if (isBankMsg(msg)) {
      if (isSendMsg(msg.bank) && proposalId !== undefined) {
        modeEditor = (
          <SpendEditor
            spendMsg={msg.bank}
            contractAddress={contractAddress}
            initialRecipientAddress={recipientAddress}
            proposalId={proposalId}
            updateProposal={updateProposal}
            msgIndex={messageIndex}
          />
        )
      } else if (isBurnMsg(msg.bank)) {
        modeEditor = <h1>BURN MESSAGE NOT IMPLEMENTED</h1>
      }
    } else if (isMintMsg(msg)) {
      modeEditor = (
        <MintEditor mintMsg={msg} initialRecipientAddress={recipientAddress} />
      )
    }
    // switch (mapEntry?.messageType) {
    //   case ProposalMessageType.Spend:
    //     modeEditor = (
    //       <SpendEditor
    //         spendMsg={msg}
    //         contractAddress={contractAddress}
    //         initialRecipientAddress={recipientAddress}
    //       ></SpendEditor>
    //     )
    //     break
    //   case ProposalMessageType.Mint: {
    //     modeEditor = (
    //       <MintEditor
    //         mintMsg={msg}
    //         initialRecipientAddress={recipientAddress}
    //       ></MintEditor>
    //     )
    //     break
    //   }
    //   case ProposalMessageType.Custom:
    //     modeEditor = <CustomEditor customMsg={msg} />
    //     break
    //   case ProposalMessageType.Wasm:
    //     modeEditor = <CustomEditor customMsg={msg} />
    //     break
    // }

    return (
      <li
        className="py-8"
        key={`msg_${messageIndex}`}
        onClick={() => setActiveMessage(messageIndex)}
      >
        <div title={label} className="whitespace-nowrap text-left">
          <h5 className="text-lg font-bold">
            {label}{' '}
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                removeMessage(messageIndex)
              }}
              title="Delete message"
              className="btn btn-circle btn-xs float-right"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-4 h-4 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </h5>
        </div>
        {modeEditor}
      </li>
    )
  })

  const addMessage = (message: CosmosMsgFor_Empty) => {
    updateProposal({
      ...proposal,
      msgs: [...proposal.msgs, message],
    })
  }

  const addWasmMessage = () => {
    addMessage({ wasm: {} } as any)
  }

  const addCustomMessage = () => {
    addMessage({ custom: {} } as CosmosMsgFor_Empty)
  }

  const addSpendMessage = () => {
    try {
      const message: CosmosMsgFor_Empty = makeSpendMessage(
        '',
        recipientAddress,
        contractAddress
      )
      addMessage(message)
    } catch (e) {
      console.error(e)
    }
  }

  const addMintMessage = () => {
    try {
      addMessage(makeMintMessage('', recipientAddress) as any)
    } catch (e) {
      console.error(e)
    }
  }

  const removeMessage = (messageIndex: number) => {
    const msgs = [...proposal.msgs]
    const removed = msgs.splice(messageIndex, 1)
    if (removed) {
      updateProposal({
        ...proposal,
        msgs,
      })
      // setActiveMessage(-1)
    } else {
      console.warn(`no message at ${messageIndex}`)
    }
  }

  const setActiveMessage = (activeMessageIndex: number) => {
    setProposalMapItem({
      ...(proposalMapItem ?? EmptyProposalItem),
      activeMessageIndex,
    })
  }

  function handleJsonChanged(json: any) {
    setEditProposalJson(false)
  }

  function handleDescriptionBlur(e: ChangeEvent<HTMLTextAreaElement>) {
    setProposalDescription(e.target.value)
  }

  function handleDescriptionTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setProposalDescription(e.target.value)
  }

  // TODO preview mode for the whole proposal
  if (editProposalJson) {
    return <RawEditor json={proposal} onChange={handleJsonChanged}></RawEditor>
  }

  const fieldErrorMessage = makeFieldErrorMessage(errors)

  const editorClassName = proposalDescriptionErrorMessage
    ? 'input input-error input-bordered rounded box-border py-3 px-8 h-full w-full text-xl'
    : 'input input-bordered rounded box-border py-3 px-8 h-full w-full text-xl'

  const errorComponent = error ? (
    <div className="mt-8">
      <LineAlert variant="error" msg={error} />
    </div>
  ) : null

  return (
    <div className="flex flex-col w-full flex-row">
      <div className="grid bg-base-100">
        <div className="flex">
          <div className="text-left container mx-auto">
            <h1 className="text-4xl my-8 text-bold">Create Proposal</h1>
            <form
              className="text-left container mx-auto"
              onSubmit={handleSubmit<any>(onSubmit)}
            >
              <InputField
                fieldName="label"
                label="Name"
                toolTip="Name the Proposal"
                errorMessage="Proposal name required"
                readOnly={complete}
                register={register}
                fieldErrorMessage={fieldErrorMessage}
                defaultValue={proposal.title}
                onChange={(e) => setProposalTitle(e?.target?.value)}
              />
              <InputFieldLabel
                errorText={proposalDescriptionErrorMessage}
                fieldName="description"
                label="Description"
                toolTip="Your proposal description"
              />
              <textarea
                className={editorClassName}
                // onChange={handleDescriptionChange}
                onChange={handleDescriptionTextChange}
                defaultValue={proposal.description}
                readOnly={complete}
                // dark={themeContext.theme === 'junoDark'}
                onBlur={handleDescriptionBlur}
                id="description"
              ></textarea>
              <label htmlFor="message-list" className="block mt-4 text-xl">
                Messages{' '}
                <HelpTooltip text="Messages that will be executed on chain." />
              </label>
              <ul id="message-list">{messages}</ul>
              <br />

              <MessageSelector actions={messageActions}></MessageSelector>
              <br />

              {!complete && (
                <div>
                  <button
                    key="create"
                    className={`btn btn-primary text-lg mt-8 ml-auto ${
                      loading ? 'loading' : ''
                    }`}
                    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                    type="submit"
                    disabled={loading}
                  >
                    Create Proposal
                  </button>
                  <button
                    key="save_draft"
                    className={`btn btn-secondary text-lg mt-8 ml-auto ${
                      loading ? 'loading' : ''
                    }`}
                    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                    disabled={loading}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      saveDraftProposal(proposal)
                    }}
                  >
                    Save Draft
                  </button>
                  <button
                    key="delete_draft"
                    className={`btn btn-secondary text-lg mt-8 ml-auto ${
                      loading ? 'loading' : ''
                    }`}
                    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                    disabled={loading}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      deleteDraftProposal()
                    }}
                  >
                    Delete Draft
                  </button>
                </div>
              )}
              {errorComponent}
            </form>
          </div>
        </div>
      </div>
      <ProposalList
        proposals={proposals}
        contractAddress={contractAddress}
        hideLoadMore={true}
        onLoadMore={() => {}}
      />
    </div>
  )
}
