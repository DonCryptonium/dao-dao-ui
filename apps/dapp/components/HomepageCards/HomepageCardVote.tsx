// GNU AFFERO GENERAL PUBLIC LICENSE Version 3. Copyright (C) 2022 DAO DAO Contributors.
// See the "LICENSE" file in the root directory of this package for more copyright information.

import { CheckIcon, XIcon } from '@heroicons/react/outline'
import Emoji from 'a11y-react-emoji'
import clsx from 'clsx'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import { Abstain, Airplane } from '@dao-dao/icons'
import { Vote as VoteChoice } from '@dao-dao/state/clients/cw-proposal-single'
import { Button } from '@dao-dao/ui'
import { formatPercentOf100 } from '@dao-dao/utils'

const VOTER_WEIGHT_PERCENT = formatPercentOf100(7)

export const HomepageCardVote = () => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<VoteChoice | undefined>()

  return (
    <div className="flex flex-col gap-3 p-4 max-w-3xl bg-primary rounded-lg border border-default backdrop-blur-lg">
      <div className="flex gap-2 items-center">
        <p className="mr-1 text-2xl">
          <Emoji label={t('emoji.ballotBox')} symbol="🗳" />
        </p>
        <p className="primary-text">{t('title.casting')}</p>
        <p className="secondary-text">
          {t('info.percentVotingPower', {
            percent: VOTER_WEIGHT_PERCENT,
          })}
        </p>
      </div>
      <div className="flex flex-wrap grid-cols-3 gap-2 md:grid">
        <Button
          className={clsx('group transition', {
            'bg-valid hover:bg-valid': selected === VoteChoice.Yes,
          })}
          onClick={() =>
            setSelected((s) =>
              s === VoteChoice.Yes ? undefined : VoteChoice.Yes
            )
          }
          variant="secondary"
        >
          <CheckIcon
            className={clsx('w-4', {
              'text-base': selected === VoteChoice.Yes,
              'group-hover:text-base text-valid': selected !== VoteChoice.Yes,
            })}
          />
          {t('info.yes')}
        </Button>
        <Button
          className={clsx('group transition', {
            'bg-error hover:bg-error': selected === VoteChoice.No,
          })}
          onClick={() =>
            setSelected((s) =>
              s === VoteChoice.No ? undefined : VoteChoice.No
            )
          }
          variant="secondary"
        >
          <XIcon
            className={clsx('w-4', {
              'text-base': selected === VoteChoice.No,
              'group-hover:text-base text-error': selected !== VoteChoice.No,
            })}
          />
          {t('info.no')}
        </Button>
        <Button
          className={clsx('group transition', {
            'bg-tertiary hover:bg-tertiary': selected === VoteChoice.Abstain,
          })}
          onClick={() =>
            setSelected((s) =>
              s === VoteChoice.Abstain ? undefined : VoteChoice.Abstain
            )
          }
          variant="secondary"
        >
          <Abstain fill="currentColor" />
          {t('info.abstain')}
        </Button>
      </div>
      <Button
        disabled={selected === undefined}
        onClick={() => {
          toast.success('Think this is neat? You should try the real thing! :)')
          setSelected(undefined)
        }}
      >
        <div className="flex gap-2 justify-center items-center w-full">
          <p>{t('button.castYourVote')}</p> <Airplane stroke="currentColor" />
        </div>
      </Button>
    </div>
  )
}
