import { useRecoilValue } from 'recoil'

import {
  ArrowNarrowRightIcon,
  CashIcon,
  ChartPieIcon,
} from '@heroicons/react/outline'
import { Button } from 'ui'

import {
  daoSelector,
  tokenConfig,
  unstakingDuration as unstakingDurationSelector,
} from 'selectors/daos'
import {
  humanReadableDuration,
  convertMicroDenomToDenomWithDecimals,
  getThresholdAndQuorumDisplay,
} from 'util/conversion'

import { GovInfoListItem, TreasuryBalances } from './ContractView'
import SvgVotes from './icons/Votes'

export function DaoContractInfo({ address }: { address: string }) {
  const daoInfo = useRecoilValue(daoSelector(address))
  const govTokenInfo = useRecoilValue(tokenConfig(daoInfo.gov_token))

  const [threshold, quorum] = getThresholdAndQuorumDisplay(
    daoInfo.config.threshold,
    false,
    govTokenInfo.decimals
  )

  const unstakingDuration = useRecoilValue(
    unstakingDurationSelector(daoInfo.staking_contract)
  )

  return (
    <div className="flex flex-row flex-wrap gap-3 md:grid md:grid-cols-2 border-b border-neutral py-6">
      <div>
        <h2 className="font-medium text-lg mb-6">Governance Details</h2>
        <ul className="list-none ml-2 mt-3 flex flex-col gap-2">
          <GovInfoListItem
            icon={<ChartPieIcon className="w-4 inline" />}
            text="Unstaking period"
            value={humanReadableDuration(unstakingDuration)}
          />
          <GovInfoListItem
            icon={<SvgVotes fill="currentColor" width="16px" />}
            text="Passing threshold"
            value={threshold as string}
          />
          {quorum && (
            <GovInfoListItem
              icon={<SvgVotes fill="currentColor" width="16px" />}
              text="Quorum"
              value={quorum}
            />
          )}
          <GovInfoListItem
            icon={<CashIcon className="w-4 inline" />}
            text="Proposal deposit refund"
            value={daoInfo.config.refund_failed_proposals ? 'ON' : 'OFF'}
          />
          <li className="flex flex-row items-center text-sm">
            <span className="text-secondary flex items-center gap-1">
              <SvgVotes fill="currentColor" width="16px" />{' '}
              {convertMicroDenomToDenomWithDecimals(
                daoInfo.config.proposal_deposit,
                govTokenInfo.decimals
              )}{' '}
              ${govTokenInfo.symbol} proposal deposit
            </span>
          </li>
        </ul>
      </div>
      <div>
        <div className="flex justify-between items-center">
          <h2 className="font-medium text-lg">DAO Treasury</h2>
          <Button
            size="md"
            variant="ghost"
            iconAfter={
              <ArrowNarrowRightIcon
                className="inline h-4 w-4"
                style={{ transform: 'rotateY(0deg) rotate(-45deg)' }}
              />
            }
          >
            Deposit
          </Button>
        </div>
        <TreasuryBalances address={address} />
      </div>
    </div>
  )
}
