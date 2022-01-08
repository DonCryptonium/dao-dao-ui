import React, { useEffect, useReducer, useState } from 'react'
import { CosmosMsgFor_Empty } from '@dao-dao/types/contracts/cw3-dao'
import HelpTooltip from 'components/HelpTooltip'
import { useSigningClient } from 'contexts/cosmwasm'
import { useThemeContext } from 'contexts/theme'
import { useCw20IncreaseAllowance } from 'hooks/cw20'
import { useDaoConfig } from 'hooks/dao'
import { ProposalMessageType } from 'models/proposal/messageMap'
import { EmptyProposal, Proposal } from 'models/proposal/proposal'
import {
  ProposalAction,
  ProposalRemoveMessage,
  ProposalUpdateFromMessage,
} from 'models/proposal/proposalActions'
import { ProposalReducer } from 'models/proposal/proposalReducer'
import {
  messageForProposal,
  proposalMessages,
} from 'models/proposal/proposalSelectors'
import { useForm } from 'react-hook-form'
import Editor from 'rich-markdown-editor'
import { isValidAddress } from 'util/isValidAddress'
import {
  labelForMessage,
  makeMintMessage,
  makeSpendMessage,
} from 'util/messagehelpers'
import CustomEditor from './CustomEditor'
import InputField, {
  InputFieldLabel,
  makeFieldErrorMessage,
} from './InputField'
import LineAlert from './LineAlert'
import MessageSelector from './MessageSelector'
import MintEditor from './MintEditor'
import RawEditor from './RawEditor'
import SpendEditor from './SpendEditor'
import { cleanChainError } from 'util/cleanChainError'

export default function ProposalEditor({
  initialProposal,
  loading,
  error,
  onProposal,
  contractAddress,
  recipientAddress,
  multisig,
}: {
  initialProposal?: Proposal
  loading?: boolean
  error?: string
  onProposal: (
    proposal: Proposal,
    contractAddress: string,
    govTokenAddress?: string
  ) => void
  contractAddress: string
  recipientAddress: string
  multisig?: boolean
}) {
  const [proposal, dispatch] = useReducer(ProposalReducer, {
    ...(initialProposal || EmptyProposal),
  })

  const { execute: cw20ExecuteIncreaseAllowance } = useCw20IncreaseAllowance()

  const [description, setDescription] = useState('')
  const [editProposalJson, setEditProposalJson] = useState(false)
  const [proposalDescriptionErrorMessage, setProposalDescriptionErrorMessage] =
    useState('')
  const [deposit, setDeposit] = useState('0')
  const [tokenAddress, setTokenAddress] = useState('')

  const themeContext = useThemeContext()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  let messageActions = [
    {
      label: 'Spend',
      id: 'spend',
      execute: () => addMessage(ProposalMessageType.Spend),
      href: '#',
      isEnabled: () => true,
    },
    {
      label: 'Custom',
      id: 'custom',
      execute: () => addMessage(ProposalMessageType.Custom),
      href: '#',
      isEnabled: () => true,
    },
  ]

  // If DAO
  if (!multisig) {
    // Add DAO specific actions
    messageActions.push({
      label: 'Mint',
      id: 'mint',
      execute: () => addMessage(ProposalMessageType.Mint),
      href: '#',
      isEnabled: () => true,
    })
  }

  // Try to fetch DAO info...
  const { daoInfo } = useDaoConfig(contractAddress)
  useEffect(() => {
    setDeposit(daoInfo?.config.proposal_deposit as string)
    setTokenAddress(daoInfo?.gov_token as string)
  }, [daoInfo])

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
    // If the contract needs a deposit, increase allowance
    if (deposit && deposit !== '0') {
      await cw20ExecuteIncreaseAllowance(tokenAddress, deposit, contractAddress)
    }
    // We don't actually care about what the form processor returned in this
    // case, just that the proposal is filled out correctly, which if
    // the submit method gets called it will be.
    if (isProposalValid(proposal)) {
      onProposal(proposal, contractAddress, daoInfo?.gov_token)
    }
  }

  function setProposalTitle(title: string) {
    dispatch({ type: 'setTitle', title })
  }

  function setProposalDescription(description: string) {
    dispatch({ type: 'setDescription', description })
    if (description) {
      setProposalDescriptionErrorMessage('')
    } else {
      setProposalDescriptionErrorMessage('Proposal description required')
    }
  }

  let messages = proposalMessages(proposal).map((mapEntry, key) => {
    const label = labelForMessage(mapEntry.message)

    let modeEditor = null
    switch (mapEntry?.messageType) {
      case ProposalMessageType.Spend:
        modeEditor = (
          <SpendEditor
            dispatch={dispatch}
            spendMsg={mapEntry}
            contractAddress={contractAddress}
            initialRecipientAddress={recipientAddress}
          ></SpendEditor>
        )
        break
      case ProposalMessageType.Mint: {
        modeEditor = (
          <MintEditor
            dispatch={dispatch}
            mintMsg={mapEntry}
            initialRecipientAddress={recipientAddress}
          ></MintEditor>
        )
        break
      }
      case ProposalMessageType.Custom:
        modeEditor = <CustomEditor dispatch={dispatch} customMsg={mapEntry} />
        break
    }

    return (
      <li
        className="my-4"
        key={mapEntry.id}
        onClick={() =>
          dispatch({
            type: 'setActiveMessage',
            id: mapEntry.id,
          })
        }
      >
        <div title={label} className="whitespace-nowrap text-left">
          <h5 className="text-lg font-bold">
            {mapEntry.messageType.toUpperCase()} {label}{' '}
            <button
              onClick={() => removeMessage(mapEntry.id)}
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

  const addMessage = (messageType: ProposalMessageType) => {
    if (messageType === ProposalMessageType.Spend) {
      addSpendMessage()
    } else if (messageType === ProposalMessageType.Mint) {
      addMintMessage()
    } else if (messageType === ProposalMessageType.Custom) {
      addCustomMessage()
    }
  }

  const addCustomMessage = () => {
    const action: ProposalAction = {
      type: 'addMessage',
      message: { custom: {} } as CosmosMsgFor_Empty,
      messageType: ProposalMessageType.Custom,
    }
    dispatch(action)
  }

  const addSpendMessage = () => {
    const validAddress = !!(
      recipientAddress && isValidAddress(recipientAddress)
    )
    if (validAddress) {
      try {
        const message = makeSpendMessage('', recipientAddress, contractAddress)
        const messageType = ProposalMessageType.Spend
        const action: ProposalAction = {
          type: 'addMessage',
          message,
          messageType,
        }
        dispatch(action)
      } catch (e) {
        console.error(e)
      }
    }
  }

  const addMintMessage = () => {
    const validAddress = !!(
      recipientAddress && isValidAddress(recipientAddress)
    )
    if (validAddress) {
      try {
        const message = makeMintMessage('', recipientAddress)
        const messageType = ProposalMessageType.Mint
        const action: ProposalAction = {
          type: 'addMessage',
          message,
          messageType,
        }
        dispatch(action)
      } catch (e) {
        console.error(e)
      }
    }
  }

  const removeMessage = (messageId: string) => {
    const removeMessageAction: ProposalRemoveMessage = {
      type: 'removeMessage',
      id: messageId,
    }
    dispatch(removeMessageAction)
  }

  function handleJsonChanged(json: any) {
    const updateFromJsonAction: ProposalUpdateFromMessage = {
      type: 'updateFromMessage',
      message: json,
    }
    setEditProposalJson(false)
    dispatch(updateFromJsonAction)
  }

  function handleDescriptionChange(newValue: () => string) {
    let val = newValue()
    if (val.trim() == '\\') {
      val = ''
    }
    setDescription(val)
  }

  // TODO preview mode for the whole proposal
  if (editProposalJson) {
    return (
      <RawEditor
        json={messageForProposal(proposal, contractAddress)}
        onChange={handleJsonChanged}
      ></RawEditor>
    )
  }

  const fieldErrorMessage = makeFieldErrorMessage(errors)

  const editorClassName = proposalDescriptionErrorMessage
    ? 'input input-error input-bordered rounded box-border py-3 px-8 h-full w-full text-xl'
    : 'input input-bordered rounded box-border py-3 px-8 h-full w-full text-xl'

  return (
    <div className="flex flex-col w-full flex-row">
      <div className="grid bg-base-100">
        <div className="flex">
          <div className="text-left container mx-auto">
            <h1 className="text-2xl font-medium mb-3">Create Proposal</h1>
            <form
              className="text-left container mx-auto"
              onSubmit={handleSubmit<any>(onSubmit)}
            >
              <InputField
                fieldName="label"
                label="Name"
                toolTip="The name of the Proposal"
                errorMessage="Proposal name required"
                register={register}
                fieldErrorMessage={fieldErrorMessage}
                onChange={(e) => setProposalTitle(e?.target?.value)}
              />
              <InputFieldLabel
                errorText={proposalDescriptionErrorMessage}
                fieldName="description"
                label="Description"
                toolTip="Your proposal description"
              />
              <Editor
                className={editorClassName}
                onChange={handleDescriptionChange}
                defaultValue={proposal.description}
                dark={themeContext.theme === 'junoDark'}
                id="description"
              />
              <label htmlFor="message-list" className="block mt-6 text-lg">
                Messages{' '}
                <HelpTooltip text="Messages that will be executed on chain." />
              </label>
              <ul id="message-list list-none">{messages}</ul>
              <br />
              <MessageSelector actions={messageActions}></MessageSelector>
              <br />
              <button
                className={`btn btn-primary btn-md font-semibold normal-case text-lg mt-6 ml-auto ${
                  loading ? 'loading' : ''
                }`}
                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                type="submit"
                disabled={loading}
                onClick={(e) => {
                  setProposalDescription(description)
                }}
              >
                {deposit && deposit !== '0'
                  ? 'Deposit & create propsal'
                  : 'Create proposal'}
              </button>
              {error && (
                <div className="mt-8">
                  <LineAlert variant="error" msg={cleanChainError(error)} />
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
