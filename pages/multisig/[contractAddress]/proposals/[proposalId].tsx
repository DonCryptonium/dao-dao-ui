import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import {
  ProposalDetails,
  ProposalDetailsSidebar,
} from 'components/ProposalDetails'
import { Breadcrumbs } from 'components/Breadcrumbs'
import { useRecoilValue } from 'recoil'
import { sigSelector } from 'selectors/multisigs'

const Proposal: NextPage = () => {
  const router = useRouter()
  const proposalId = router.query.proposalId as string
  const contractAddress = router.query.contractAddress as string
  const sigInfo = useRecoilValue(sigSelector(contractAddress))

  return (
    <div className="grid grid-cols-6">
      <div className="w-full col-span-4 p-6">
        <Breadcrumbs
          crumbs={[
            ['/multisig/list', 'Multisigs'],
            [`/multisig/${contractAddress}`, sigInfo.config.name],
            [router.asPath, `Proposal ${proposalId}`],
          ]}
        />
        <ProposalDetails
          contractAddress={contractAddress}
          proposalId={Number(proposalId)}
          multisig
        />
      </div>
      <div className="col-span-2 p-6 bg-base-200 min-h-screen">
        <ProposalDetailsSidebar
          contractAddress={contractAddress}
          proposalId={Number(proposalId)}
          multisig
        />
      </div>
    </div>
  )
}

export default Proposal
