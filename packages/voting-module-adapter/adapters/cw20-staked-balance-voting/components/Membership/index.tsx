import { HandIcon, MinusSmIcon, PlusSmIcon } from '@heroicons/react/outline'
import { useWalletManager } from '@cosmos-wallet/react'
import clsx from 'clsx'
import { ComponentType, FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { ConnectWalletButton } from '@dao-dao/common'
import { stakingLoadingAtom } from '@dao-dao/state'
import {
  BalanceCard,
  BalanceIcon,
  StakingMode,
  SuspenseLoader,
} from '@dao-dao/ui'
import {
  convertMicroDenomToDenomWithDecimals,
  formatPercentOf100,
} from '@dao-dao/utils'

import { useVotingModuleAdapterOptions } from '../../../../react/context'
import { BaseMembershipProps } from '../../../../types'
import { useGovernanceTokenInfo, useStakingInfo } from '../../hooks'
import { StakingModal } from '../StakingModal'
import { ClaimsPendingList as DefaultClaimsPendingList } from './ClaimsPendingList'

interface MembershipProps extends BaseMembershipProps {
  primaryText?: boolean
  // If displayed in the SDA, we want to hide the title and claim card as
  // well as make the balance cards responsive. This is because it is laid
  // out differently, taking up a full page, and the title and claim are
  // handled separately. See ../SdaMembershipPage/index.tsx
  sdaMode?: boolean
  ClaimsPendingList?: ComponentType<{
    showClaim: () => void
  }>
}

export const Membership = ({ primaryText, ...props }: MembershipProps) => {
  const { t } = useTranslation()
  const { Loader } = useVotingModuleAdapterOptions()

  return (
    <>
      <h2
        className={clsx('mb-4', primaryText ? 'primary-text' : 'title-text', {
          hidden: props.sdaMode,
        })}
      >
        {t('title.yourVotingPower')}
      </h2>

      <SuspenseLoader fallback={<Loader className="mt-4 h-min" />}>
        <InnerMembership {...props} />
      </SuspenseLoader>
    </>
  )
}

const InnerMembership: FC<Omit<MembershipProps, 'primaryText'>> = ({
  sdaMode,
  ClaimsPendingList = DefaultClaimsPendingList,
  proposalModuleDepositInfos,
}) => {
  const { t } = useTranslation()
  const {
    governanceTokenAddress,
    governanceTokenInfo,
    governanceTokenMarketingInfo,
    walletBalance: unstakedGovTokenBalance,
  } = useGovernanceTokenInfo({ fetchWalletBalance: true })
  const {
    walletStakedValue,
    totalStakedValue,
    blockHeight,
    sumClaimsAvailable,
  } = useStakingInfo({
    fetchWalletStakedValue: true,
    fetchTotalStakedValue: true,
    fetchClaims: true,
  })

  const { connected } = useWalletManager()

  // Set to a StakingMode to display modal.
  const [showStakingMode, setShowStakingMode] = useState<StakingMode>()
  const stakingLoading = useRecoilValue(stakingLoadingAtom)

  // Of all the proposal modules this DAO uses, find the highest proposal
  // deposit that uses the governance token. When staking, we'll suggest that
  // the user reserve that amount for proposals.
  const maxGovernanceTokenProposalDeposit = useMemo(
    () =>
      Math.max(
        0,
        ...proposalModuleDepositInfos
          .filter(({ token }) => token === governanceTokenAddress)
          .map(({ deposit }) => Number(deposit))
      ),
    [proposalModuleDepositInfos, governanceTokenAddress]
  )

  if (!connected) {
    return <ConnectWalletButton />
  }

  if (
    blockHeight === undefined ||
    unstakedGovTokenBalance === undefined ||
    walletStakedValue === undefined ||
    totalStakedValue === undefined
  ) {
    throw new Error(t('error.loadingData'))
  }

  const tokenImageUrl =
    !!governanceTokenMarketingInfo.logo &&
    governanceTokenMarketingInfo.logo !== 'embedded' &&
    'url' in governanceTokenMarketingInfo.logo
      ? governanceTokenMarketingInfo.logo.url
      : undefined

  return (
    <>
      <div
        className={clsx('flex flex-col gap-2 items-stretch lg:gap-4', {
          'md:flex-row': sdaMode,
        })}
      >
        {!unstakedGovTokenBalance &&
          !walletStakedValue &&
          !sumClaimsAvailable &&
          !sdaMode && <p className="caption-text">{t('info.notAMember')}</p>}
        {unstakedGovTokenBalance > 0 && walletStakedValue === 0 && (
          <BalanceCard
            buttonLabel={t('button.stakeTokens')}
            icon={<PlusSmIcon className="w-4 h-4" />}
            loading={stakingLoading}
            onClick={() => setShowStakingMode(StakingMode.Stake)}
            opaque
            title={t('info.notAMemberYet')}
          >
            <div className="flex flex-row gap-2 items-center mb-2">
              <BalanceIcon iconURI={tokenImageUrl} />

              <p className="font-bold">
                {convertMicroDenomToDenomWithDecimals(
                  unstakedGovTokenBalance,
                  governanceTokenInfo.decimals
                ).toLocaleString(undefined, {
                  maximumFractionDigits: governanceTokenInfo.decimals,
                })}{' '}
                ${governanceTokenInfo.symbol}
                <span className="ml-1 secondary-text">
                  {t('info.unstaked')}
                </span>
              </p>
            </div>

            <p className="secondary-text">{t('button.stakeToJoinAndVote')}</p>
          </BalanceCard>
        )}
        {walletStakedValue > 0 && (
          <BalanceCard
            buttonLabel={t('button.unstakeTokens')}
            icon={<MinusSmIcon className="w-4 h-4" />}
            loading={stakingLoading}
            onClick={() => setShowStakingMode(StakingMode.Unstake)}
            title={t('title.votingPower')}
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2 items-center">
                <BalanceIcon iconURI={tokenImageUrl} />
                <p className="title-text">
                  {formatPercentOf100(
                    totalStakedValue
                      ? (walletStakedValue / totalStakedValue) * 100
                      : 0
                  )}
                </p>
              </div>

              <p className="ml-6 secondary-text">
                {t('info.tokensStaked', {
                  amount: convertMicroDenomToDenomWithDecimals(
                    walletStakedValue,
                    governanceTokenInfo.decimals
                  ).toLocaleString(undefined, {
                    maximumFractionDigits: governanceTokenInfo.decimals,
                  }),
                  tokenSymbol: governanceTokenInfo.symbol,
                })}
              </p>
            </div>
          </BalanceCard>
        )}
        {!!sumClaimsAvailable && !sdaMode && (
          <BalanceCard
            buttonLabel={t('button.claimTokens')}
            icon={<HandIcon className="w-4 h-4" />}
            loading={stakingLoading}
            onClick={() => setShowStakingMode(StakingMode.Claim)}
            title={t('info.yourTokensUnstaked', {
              tokenSymbol: governanceTokenInfo.symbol,
            })}
          >
            <div className="flex flex-row flex-wrap gap-2 items-center primary-text">
              <BalanceIcon iconURI={tokenImageUrl} />
              {convertMicroDenomToDenomWithDecimals(
                sumClaimsAvailable,
                governanceTokenInfo.decimals
              ).toLocaleString(undefined, {
                maximumFractionDigits: governanceTokenInfo.decimals,
              })}{' '}
              ${governanceTokenInfo.symbol}
            </div>
          </BalanceCard>
        )}
        {walletStakedValue > 0 && unstakedGovTokenBalance > 0 && (
          <BalanceCard
            buttonLabel={t('button.stakeTokens')}
            icon={<PlusSmIcon className="w-4 h-4" />}
            loading={stakingLoading}
            onClick={() => setShowStakingMode(StakingMode.Stake)}
            opaque
            title={t('info.couldHaveMoreVotingPower')}
          >
            <div className="flex flex-row gap-2 items-center mb-2">
              <BalanceIcon iconURI={tokenImageUrl} />

              <p className="font-bold">
                {convertMicroDenomToDenomWithDecimals(
                  unstakedGovTokenBalance,
                  governanceTokenInfo.decimals
                ).toLocaleString(undefined, {
                  maximumFractionDigits: governanceTokenInfo.decimals,
                })}{' '}
                ${governanceTokenInfo.symbol}
                <span className="ml-1 secondary-text">
                  {t('info.unstaked')}
                </span>
              </p>
            </div>

            <p className="secondary-text">
              {t('info.stakeToIncreaseVotingPower')}
            </p>
          </BalanceCard>
        )}
      </div>

      <ClaimsPendingList
        showClaim={() => setShowStakingMode(StakingMode.Claim)}
      />

      {showStakingMode !== undefined && (
        <StakingModal
          deposit={
            maxGovernanceTokenProposalDeposit
              ? maxGovernanceTokenProposalDeposit.toString()
              : undefined
          }
          mode={showStakingMode}
          onClose={() => setShowStakingMode(undefined)}
        />
      )}
    </>
  )
}
