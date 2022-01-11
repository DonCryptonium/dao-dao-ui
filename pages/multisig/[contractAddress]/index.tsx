import { Threshold } from "@dao-dao/types/contracts/cw3-multisig"
import { ScaleIcon, UserGroupIcon, VariableIcon } from "@heroicons/react/outline"
import { Breadcrumbs } from "components/Breadcrumbs"
import { ContractBalances, ContractProposalsDispaly, GradientHero, HeroContractFooter, HeroContractHeader } from "components/ContractView"
import { NextPage } from "next"
import { useRouter } from "next/router"
import { useRecoilValue } from "recoil"
import { isMemberSelector } from "selectors/daos"
import { listMembers, memberWeight, sigSelector, totalWeight } from "selectors/multisigs"
import { nativeBalance, walletAddress } from "selectors/treasury"

const thresholdString = (t: Threshold) => {
  if ("absolute_count" in t) {
    const count = t.absolute_count.weight
    return `Passing threshold: ${count}`
  } else if ("absolute_percentage" in t) {
    const threshold = t.absolute_percentage.percentage
    return `Passing threshold: ${threshold}%`
  } else if ("threshold_quorum" in t) {
    const quorum = t.threshold_quorum.quorum
    const threshold = t.threshold_quorum.threshold
    return `Quorum: ${quorum}% ; Passing threshold: ${threshold}%`
  } else {
    return "unknown threshold type"
  }
}

function VoteBalanceCard({ weight, title, weightTotal }: { weight: number, title: string, weightTotal: number }) {
  return (
    <div className="shadow p-6 rounded-lg w-full border border-base-300 h-28 mt-2">
      <h2 className="text-sm font-mono text-secondary overflow-auto">{title}</h2>
      <div className="flex items-baseline gap-2">
        <p className="mt-2 font-bold">
          {weight}
        </p>
        <p className="text-sm text-secondary">({(weight / weightTotal * 100).toLocaleString(undefined, { maximumSignificantDigits: 3 })}%)</p>
      </div>
    </div>
  )
}

const Home: NextPage = () => {
  const router = useRouter()
  const contractAddress = router.query.contractAddress as string

  const sigInfo = useRecoilValue(sigSelector(contractAddress))
  const nativeBalances = useRecoilValue(nativeBalance(contractAddress))
  const memberInfo = useRecoilValue(isMemberSelector(contractAddress))

  const weightTotal = useRecoilValue(totalWeight(contractAddress))
  const visitorWeight = useRecoilValue(memberWeight(contractAddress))
  const visitorAddress = useRecoilValue(walletAddress)
  const memberList = useRecoilValue(listMembers(contractAddress))

  return (
    <div className="grid grid-cols-6">
      <div className="col-span-4 min-h-screen">
        <GradientHero>
          <Breadcrumbs
            crumbs={[
              ["/multisig/list", "Multisigs"],
              [`/multisig/${contractAddress}`, sigInfo.config.name]
            ]}
          />

          <HeroContractHeader
            name={sigInfo.config.name}
            member={memberInfo.member}
          />

          <HeroContractFooter>
            <div>
              <ScaleIcon className="w-5 h-5 mb-1 mr-1 inline" />
              {thresholdString(sigInfo.config.threshold)}
            </div>
            <div>
              <VariableIcon className="w-5 mb-1 mr-1 inline" />
              Total votes: {weightTotal}
            </div>
            <div>
              <UserGroupIcon className="w-5 mb-1 mr-1 inline" />
              Total members: {memberList.length}
            </div>
          </HeroContractFooter>
        </GradientHero>
        <div className="px-6">
          <ContractProposalsDispaly contractAddress={contractAddress} proposalCreateLink={`/multisig/${contractAddress}/proposals/create`} />
        </div>
      </div>
      <div className="col-start-5 col-span-2 p-6 min-h-screen h-full">
        <ContractBalances
          contractType="Multisig"
          native={nativeBalances}
        />
        <hr className="mt-8 mb-6" />
        {visitorWeight &&
          <>
            <h2 className="font-medium text-md">Your shares</h2>
            <ul className="list-none mt-3">
              <li>
                <VoteBalanceCard
                  title="voting weight"
                  weight={visitorWeight}
                  weightTotal={weightTotal}
                />
              </li>
            </ul>
          </>
        }
        <h2 className="font-medium text-md mt-3">Member shares</h2>
        <ul className="list-none mt-3">
          {memberList.filter((m) => m.addr != visitorAddress).map((member) =>
            <li key={member.addr}>
              <VoteBalanceCard
                title={member.addr}
                weight={member.weight}
                weightTotal={weightTotal}
              />
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default Home
