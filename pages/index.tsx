import type { NextPage } from 'next'
import { ChevronRightIcon } from '@heroicons/react/solid'
import Link from 'next/link'

const Home: NextPage = () => {
  return (
    <>
      <h1 className="text-6xl font-bold">InterChain DAO Tooling</h1>

      <div className="mt-3 text-2xl">Choose your adventure...</div>

      <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 max-w-full sm:w-full">
        <Link href="/multisig" passHref>
          <a className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
            <h3 className="text-2xl font-bold">
              Multisigs{' '}
              <ChevronRightIcon className="inline-block w-6 h-6 ml-2 stroke-current" />
            </h3>
            <p className="mt-4 text-xl">Shared group accounts.</p>
          </a>
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 max-w-full sm:w-full">
        <Link href="/dao" passHref>
          <a className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
            <h3 className="text-2xl font-bold">
              DAOs{' '}
              <ChevronRightIcon className="inline-block w-6 h-6 ml-2 stroke-current" />
            </h3>
            <p className="mt-4 text-xl">
              Organizations with governance tokens.
            </p>
          </a>
        </Link>
      </div>
    </>
  )
}

export default Home
