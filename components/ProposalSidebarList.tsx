import { useRecoilValue } from 'recoil'
import { proposalsState } from '../atoms/proposal-atoms'

export default function ProposalSidebarList({
  contractAddress,
  className,
}: {
  contractAddress: string
  className: string
}) {
  const proposals = useRecoilValue(proposalsState)
  const addProposal = () => {}
  let i = 0;
  const proposalListItems = proposals.map((proposal) => (
    <li key={`proposal_${i++}`}>{proposal}</li>
  ))
  return (
    <div className={className}>
      <h2 className="w-10">Proposals</h2>
      <button className="btn" onClick={addProposal}>+</button>
      <ul>{proposalListItems}</ul>
    </div>
  )
}
