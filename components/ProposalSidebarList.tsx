import { useRecoilState, useRecoilValueLoadable } from 'recoil'
import { proposalsState } from '../atoms/proposal-atoms'
// import { signingClientState } from '../atoms/cosmos-atoms'
import { cosmosSigningClient, cosmosQueryClient } from '../selectors/cosmos-selectors'

export default function ProposalSidebarList({
  contractAddress,
  className,
}: {
  contractAddress: string
  className: string
}) {
  const [proposals, setProposals] = useRecoilState(proposalsState)
  // const signingClientValue = useRecoilValueLoadable(cosmosSigningClient)
  // const signingClient =
  //   signingClientValue.state === 'hasValue'
  //     ? signingClientValue.contents
  //     : undefined
  // if (signingClient !== undefined) {
  //   const startBefore = 0
  //   async function loadProposals() {
  //     const response = await (signingClient as any).queryContractSmart(contractAddress, {
  //       reverse_proposals: {
  //         // ...(startBefore && { start_before: startBefore }),
  //         limit: 10,
  //       },
  //     })
  //     setProposals(response.proposals)
  //   }
  //   loadProposals()
  // }
  const proposalListItems = proposals.map((proposal) => (
    <li key={`proposal_${i++}`}>{(proposal as any).title}</li>
  ))
  const addProposal = () => {
    setProposals([`${new Date()}`, ...proposals])
  }
  let i = 0
  return (
    <div className={className}>
      <h2 className="w-10">Proposals</h2>
      <button className="btn" onClick={addProposal}>
        +
      </button>
      <ul>{proposalListItems}</ul>
    </div>
  )
}
