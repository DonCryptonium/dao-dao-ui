import React from 'react'
import { ChevronRightIcon } from '@heroicons/react/solid'
import { dao as daoItem } from 'selectors/dao'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useRecoilValue } from 'recoil'

const DaoHome: NextPage = () => {
  const router = useRouter()
  const contractAddress = router.query.contractAddress as string

  const dao = useRecoilValue(daoItem(contractAddress)) as any

  return (
    <>
      {dao ? (
        <>
          <h1 className="text-6xl font-bold">{dao.name}</h1>
          <h4 className="text-xl">{dao.description}</h4>
          <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 max-w-full sm:w-full">
            <Link href={`/dao/${contractAddress}/proposals`} passHref>
              <a className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
                <h3 className="text-2xl font-bold">
                  Proposals{' '}
                  <ChevronRightIcon className="inline-block w-6 h-6 ml-2 stroke-current" />
                </h3>
                <p className="mt-4 text-xl">
                  Create and vote on proposals for the DAO to execute.
                </p>
              </a>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 max-w-full sm:w-full">
            <Link href={`/dao/${contractAddress}/treasury`} passHref>
              <a className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
                <h3 className="text-2xl font-bold">
                  Treasury{' '}
                  <ChevronRightIcon className="inline-block w-6 h-6 ml-2 stroke-current" />
                </h3>
                <p className="mt-4 text-xl">Manage DAO finances.</p>
              </a>
            </Link>
          </div>
        </>
      ) : (
        <p>DAO not found</p>
      )}
    </>
  )
}

export default DaoHome
