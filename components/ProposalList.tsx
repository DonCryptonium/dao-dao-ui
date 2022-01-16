import { Expiration, ProposalResponse } from '@dao-dao/types/contracts/cw3-dao'
import { DownloadIcon } from '@heroicons/react/outline'
import {
  proposalListAtom,
  proposalsCreatedAtom,
  proposalsRequestStartBeforeAtom,
} from 'atoms/proposals'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { proposalCount } from 'selectors/daos'
import { onChainProposalsSelector } from 'selectors/proposals'
import ProposalStatus from './ProposalStatus'

const PROP_LOAD_LIMIT = 10

const getOldestLoadedProposal = (props: ProposalResponse[]) => {
  if (!props.length) {
    return Infinity
  }
  return props[props.length - 1].id
}

const getNewestLoadedProposal = (props: ProposalResponse[]) => {
  if (!props.length) {
    return 0
  }
  return props[0].id
}

const zeroPad = (num: number, target: number) => {
  const s = num.toString()
  if (s.length > target) {
    return s
  }
  return '0'.repeat(target - s.length) + s
}

const secondsToHm = (seconds: number) => {
  var h = Math.floor(seconds / 3600)
  var m = Math.floor((seconds % 3600) / 60)
  var s = Math.floor((seconds % 3600) % 60)

  var hDisplay =
    h > 0 ? h + (h == 1 ? ' hr' : ' hrs') + (m > 0 || s > 0 ? ', ' : '') : ''
  var mDisplay = m > 0 ? m + (m == 1 ? ' min' : ' mins') : ''
  return hDisplay + mDisplay
}

export const getEnd = (exp: Expiration) => {
  if ('at_time' in exp) {
    const end = Number(exp['at_time'])
    const nowSeconds = new Date().getTime() / 1000
    const endSeconds = end / 1000000000
    if (endSeconds <= nowSeconds) {
      return 'Completed'
    } else {
      return secondsToHm(endSeconds - nowSeconds)
    }
  }
  // Not much we can say about proposals that expire at a block
  // height / never.
  return ''
}

function ProposalLine({
  prop,
  border,
  contractAddress,
  multisig,
}: {
  prop: ProposalResponse
  border: boolean
  contractAddress: string
  multisig?: boolean
}) {
  return (
    <Link
      href={`/${multisig ? 'multisig' : 'dao'}/${contractAddress}/proposals/${
        prop.id
      }`}
    >
      <a>
        <div
          className={
            'grid grid-cols-6 items-center py-2' + (border ? ' border-b' : '')
          }
        >
          <p className="font-mono text-sm text-secondary">
            # {zeroPad(prop.id, 6)}
          </p>
          <ProposalStatus status={prop.status} />
          <p className="col-span-3 text-medium truncate">{prop.title}</p>
          <p className="text-neutral text-sm">{getEnd(prop.expires)}</p>
        </div>
      </a>
    </Link>
  )
}

export function ProposalList({
  contractAddress,
  multisig,
}: {
  contractAddress: string
  multisig?: boolean
}) {
  // Our position in the DAO's list of proposals.
  const [startBefore, setStartBefore] = useRecoilState(
    proposalsRequestStartBeforeAtom
  )
  // The proposals that we have loaded.
  const [propList, setPropList] = useRecoilState(
    proposalListAtom(contractAddress)
  )
  // The number of proposals that have been created by the visitor and not added to the propList
  const [propsCreated, setPropsCreated] = useRecoilState(
    proposalsCreatedAtom(contractAddress)
  )

  // Update the proposal list with any proposals that were created
  // since we were last here.
  const newProps = useRecoilValue(
    onChainProposalsSelector({
      contractAddress,
      startBefore: getNewestLoadedProposal(propList) + propsCreated + 1,
      limit: propsCreated,
    })
  )

  useEffect(() => {
    setPropList((p) => {
      // Need to check this condition here instead of outside as
      // `setPropsCreated` will race against the next reflow of this
      // page which may cause a duplicate to be appended.
      if (getOldestLoadedProposal(newProps) > getNewestLoadedProposal(p)) {
        return newProps.concat(p)
      }
      return p
    })
    // We've now handled all the newly created proposals.
    setPropsCreated(0)
  }, [getOldestLoadedProposal(newProps), getNewestLoadedProposal(propList)])

  // Update the proposal list with any proposals that have been
  // requested by a load more press or first load of this page.
  const existingProps = useRecoilValue(
    onChainProposalsSelector({
      contractAddress,
      startBefore,
      limit: PROP_LOAD_LIMIT,
    })
  )

  useEffect(() => {
    // We query proposals in reverse showing the most recent (highest
    // ID) ones first. If a new query starts with a proposal with an ID
    // that is smaller than the smallest one that we have seen we can
    // safely add the new proposals to our list without worrying about
    // duplicates.
    if (existingProps.length) {
      setPropList((p) => {
        // Can't check this condition in the enclosing if statement
        // becasue setState operations don't happen
        // syncronously. Doing in above if can result in a race
        // condition where a reflow occurs before setting completes.
        if (existingProps[0].id < getOldestLoadedProposal(p)) {
          return p.concat(existingProps)
        }
        return p
      })
    }
  })

  const proposalsTotal = useRecoilValue(proposalCount(contractAddress))
  const showLoadMore = propList.length < proposalsTotal

  if (!propList.length) {
    return <p>no proposals</p>
  }
  return (
    <div>
      <ul>
        {propList.map((prop, idx) => (
          <ProposalLine
            prop={prop}
            key={prop.id}
            border={idx !== propList.length - 1 || showLoadMore}
            contractAddress={contractAddress}
            multisig={multisig}
          />
        ))}
      </ul>
      {showLoadMore && (
        <button
          className="btn btn-sm btn-outline normal-case text-left text-sm font-mono mt-3"
          onClick={() => {
            const proposal = propList && propList[propList.length - 1]
            if (proposal) {
              setStartBefore(proposal.id)
            }
          }}
        >
          Load more <DownloadIcon className="inline w-5 h-5 ml-1" />
        </button>
      )}
    </div>
  )
}
