import WalletLoader from 'components/WalletLoader'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import LineAlert from 'components/LineAlert'
import { useProposal } from 'hooks/proposals'
import ProposalDetails from 'components/ProposalDetails'
import Link from 'next/link'
import { cleanChainError } from 'util/cleanChainError'
import { ArrowNarrowLeftIcon } from '@heroicons/react/outline'
import { useRecoilValue } from 'recoil'
import { daoSelector } from 'selectors/daos'

const Proposal: NextPage = () => {
  let router = useRouter()
  let contractAddress = router.query.contractAddress as string
  const daoInfo = useRecoilValue(daoSelector(contractAddress))

  const proposalId = router.query.proposalId as string

  const {
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
  } = useProposal(contractAddress as string, proposalId)

  return (
    <WalletLoader loading={loading}>
      <div className="grid grid-cols-6">
        <div className="w-full col-span-4 p-6">
          <div className="text-md font-medium text-secondary-focus mb-6">
            <ArrowNarrowLeftIcon className="inline w-5 h-5 mr-2 mb-1" />
            <Link href="/dao/list">
              <a className="mr-2">DAOs</a>
            </Link>
            /
            <Link href={`/dao/${contractAddress}`}>
              <a className="mx-2">{daoInfo.config.name}</a>
            </Link>
            /
            <Link href={router.asPath}>
              <a className="ml-2">Proposal #{proposalId}</a>
            </Link>
          </div>

          {!proposal ? (
            <div className="text-center m-8">
              No proposal with that ID found.
            </div>
          ) : (
            <div>
              <ProposalDetails
                proposal={proposal}
                walletAddress={walletAddress}
                votes={votes}
                vote={vote}
                execute={execute}
                close={close}
                tally={tally}
                multisig={false}
              />

              {error && (
                <LineAlert
                  className="mt-2"
                  variant="error"
                  msg={cleanChainError(error)}
                />
              )}

              {transactionHash.length > 0 && (
                <div className="mt-8">
                  <LineAlert
                    variant="success"
                    msg={`Success! Transaction Hash: ${transactionHash}`}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </WalletLoader>
  )
}

export default Proposal
