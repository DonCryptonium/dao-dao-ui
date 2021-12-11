import React, { FunctionComponent } from 'react'
import { useRecoilValue } from 'recoil'
import { ChevronRightIcon } from '@heroicons/react/solid'
import type { NextPage } from 'next'
import Link from 'next/link'
import { DAO_CODE_ID } from 'util/constants'
import { daos as daoList } from 'selectors/dao'
import { DaoListType } from 'hooks/dao'

const DaoListComponent: FunctionComponent<DaoListType> = ({
  address,
  name,
  description,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 max-w-full sm:w-full">
      <Link href={`/dao/${address}`} passHref>
        <a className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
          <h3 className="text-2xl font-bold">
            {name}{' '}
            <ChevronRightIcon className="inline-block w-6 h-6 ml-2 stroke-current" />
          </h3>
          <p className="mt-4 text-xl">{description}</p>
        </a>
      </Link>
    </div>
  )
}

const DaoList: NextPage = () => {
  const daos: DaoListType[] = useRecoilValue(daoList(DAO_CODE_ID)) as any
  return (
    <>
      <h1 className="text-6xl font-bold">DAOs</h1>
      {daos.length > 0 ? (
        daos.map((dao, key) => (
          <DaoListComponent
            address={dao?.address}
            name={dao?.name}
            description={dao?.description}
            key={key}
          />
        ))
      ) : (
        <>
          <p className="text-xl my-8">No DAOs</p>
          <Link href="/multisig/create" passHref>
            <button className="btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl">
              Create a DAO
            </button>
          </Link>
        </>
      )}
    </>
  )
}

export default DaoList
