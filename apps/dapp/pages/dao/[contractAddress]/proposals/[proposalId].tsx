import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FC } from 'react'
import { useRecoilValue } from 'recoil'

import { Breadcrumbs, LoadingScreen } from '@dao-dao/ui'

import ErrorBoundary from '@/components/ErrorBoundary'
import { ProposalDetails } from '@/components/ProposalDetails'
import {
  ProposalDetailsCard,
  ProposalDetailsSidebar,
  ProposalDetailsVoteStatus,
} from '@/components/ProposalDetailsSidebar'
import { ProposalVotes } from '@/components/ProposalVotes'
import { SmallScreenNav } from '@/components/SmallScreenNav'
import { SuspenseLoader } from '@/components/SuspenseLoader'
import { daoSelector } from '@/selectors/daos'
import { cw20TokenInfo } from '@/selectors/treasury'

const InnerProposal: FC = () => {
  const router = useRouter()
  const proposalKey = router.query.proposalId as string
  const contractAddress = router.query.contractAddress as string
  const daoInfo = useRecoilValue(daoSelector(contractAddress))
  const govTokenInfo = useRecoilValue(cw20TokenInfo(daoInfo.gov_token))

  const proposalDetailsProps = {
    contractAddress,
    multisig: false,
    proposalId: Number(proposalKey),
  }

  return (
    <div className="grid grid-cols-4 lg:grid-cols-6">
      <div className="col-span-4 w-full md:p-6">
        <Breadcrumbs
          crumbs={[
            ['/starred', 'Home'],
            [`/dao/${contractAddress}`, daoInfo.config.name],
            [router.asPath, `Proposal ${proposalKey}`],
          ]}
        />

        <SmallScreenNav className="mb-4" />

        <div className="px-6 mt-6 lg:hidden">
          <ProposalDetailsCard {...proposalDetailsProps} />
        </div>

        <ProposalDetails
          contractAddress={contractAddress}
          fromCosmosMsgProps={{
            govDecimals: govTokenInfo.decimals,
          }}
          proposalId={Number(proposalKey)}
        />

        <div className="px-4 pb-6 mt-6 md:px-6 lg:hidden">
          <h3 className="mb-6 text-base font-medium">Referendum status</h3>

          <ProposalDetailsVoteStatus {...proposalDetailsProps} />
        </div>
        <ProposalVotes {...proposalDetailsProps} />
      </div>
      <div className="hidden col-span-2 p-4 min-h-screen md:p-6 lg:block bg-base-200">
        <ProposalDetailsSidebar {...proposalDetailsProps} />
      </div>
    </div>
  )
}

const ProposalPage: NextPage = () => (
  <ErrorBoundary title="Proposal Not Found">
    <SuspenseLoader fallback={<LoadingScreen />}>
      <InnerProposal />
    </SuspenseLoader>
  </ErrorBoundary>
)

export default ProposalPage
