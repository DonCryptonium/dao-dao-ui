import { XIcon } from '@heroicons/react/outline'

import { ContractSupport, MessageTemplate } from 'templates/templateList'
import { Config } from 'util/contractConfigWrapper'

import { Modal } from './Modal'

export function MessageTemplateDisplayItem({
  template,
  onClick,
}: {
  template: MessageTemplate
  onClick: () => void
}) {
  const words = template.label.split(' ')

  const icon = words[0]
  words.shift()
  const label = words.join(' ')
  const description = template.description

  return (
    <button
      className="flex flex-row gap-3 items-center p-2 hover:bg-primary transition w-full rounded"
      onClick={onClick}
      type="button"
    >
      <p className="text-3xl">{icon}</p>
      <div className="flex flex-col items-start">
        <p className="body-text">{label}</p>
        <p className="secondary-text">{description}</p>
      </div>
    </button>
  )
}

export function ProposalTemplateSelector({
  templates,
  onLabelSelect,
  onClose,
  multisig,
}: {
  templates: MessageTemplate[]
  onLabelSelect: (
    label: string,
    getDefaults: (
      walletAddress: string,
      contractConfig: Config,
      govTokenDecimals: number
    ) => any
  ) => void
  onClose: () => void
  multisig: boolean
}) {
  return (
    <Modal>
      <div className="bg-white h-min max-w-md p-6 rounded-lg border border-focus relative">
        <button
          className="hover:bg-secondary transition rounded-full p-1 absolute right-2 top-2"
          type="button"
          onClick={onClose}
        >
          <XIcon className="h-4 w-4" />
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="header-text">Proposal templates</h1>
        </div>
        <ul className="list-none flex flex-col gap-3">
          {templates
            .filter(({ contractSupport }) => {
              switch (contractSupport) {
                case ContractSupport.Both:
                  return true
                case ContractSupport.Multisig:
                  return multisig
                case ContractSupport.DAO:
                  return !multisig
              }
            })
            .map((template, index) => (
              <li key={index}>
                <MessageTemplateDisplayItem
                  template={template}
                  onClick={() =>
                    onLabelSelect(template.label, template.getDefaults)
                  }
                />
              </li>
            ))}
        </ul>
      </div>
    </Modal>
  )
}
