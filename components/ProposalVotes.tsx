import { VoteInfo } from '@dao-dao/types/contracts/cw3-dao'
import { UserIcon } from '@heroicons/react/outline'
import { useRecoilValue } from 'recoil'
import { walletAddress as selectWalletAddress } from 'selectors/treasury'

function ProposalVotes({ votes }: { votes: VoteInfo[] }) {
  const walletAddress = useRecoilValue(selectWalletAddress)

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Voter</th>
            <th>Weight</th>
            <th>Vote</th>
          </tr>
        </thead>
        <tbody>
          {!votes ||
            (votes.length < 1 && (
              <tr>
                <td className="text-center" colSpan={3}>
                  This proposal currently has no votes
                </td>
              </tr>
            ))}
          {votes.map(({ voter, weight, vote }) => {
            if (voter === walletAddress) {
              return (
                <tr key={voter}>
                  <td>
                    <UserIcon className="h-4 w-4 mb-1 mr-1 inline" />
                    You
                  </td>
                  <td>{weight}</td>
                  <td>{vote}</td>
                </tr>
              )
            }
            return (
              <tr key={voter}>
                <td>{voter}</td>
                <td>{weight}</td>
                <td>{vote}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ProposalVotes
