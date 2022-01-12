import React, { useEffect, useState } from 'react'
import { InstantiateResult } from '@cosmjs/cosmwasm-stargate'
import { InstantiateMsg } from '@dao-dao/types/contracts/cw3-dao'
import { useSigningClient } from 'contexts/cosmwasm'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { DAO_CODE_ID } from 'util/constants'
import { convertDenomToMicroDenom } from 'util/conversion'
import { defaultExecuteFee } from 'util/fee'
import {
  makeDaoInstantiateWithExistingTokenMessage,
  makeDaoInstantiateWithNewTokenMessage,
} from 'util/messagehelpers'
import { errorNotify, successNotify } from 'util/toast'
import { isValidName, isValidTicker } from 'util/isValidTicker'
import { cleanChainError } from 'util/cleanChainError'
import {
  InformationCircleIcon,
  PaperClipIcon,
  ScaleIcon,
} from '@heroicons/react/outline'
import Link from 'next/link'
import { atom, selector, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  InputLabel,
  ToggleInput,
  NumberInput,
  TextInput,
  InputErrorMessage,
} from 'components/InputField'
import {
  validateAddress,
  validatePercent,
  validatePositive,
  validateRequired,
} from 'util/formValidation'
import { Breadcrumbs } from 'components/Breadcrumbs'

interface DaoCreateData {
  deposit: string
  description: string
  duration: string

  // The `tokenMode` state varaible inside of `CreateDAO` determines
  // which of these fields we use to instantiate the DAO.

  // Fields for creating a DAO with a new token.
  name: string
  threshold: string
  tokenName: string
  tokenSymbol: string
  daoInitialBalance: string

  // Field for creating a DAO with an existing token.
  existingTokenAddress: string

  unstakingDuration: string
  refund: string | boolean
  proposalDepositAmount: string
  [key: string]: string | boolean
}

const DEFAULT_MAX_VOTING_PERIOD_SECONDS = '604800'
const DEFAULT_UNSTAKING_DURATION_SECONDS = '0' // 12 hours

enum TokenMode {
  UseExisting,
  Create,
}

// Atoms for keeping track of token distrbution so that we can warn
// about potentially problematic ones.
const tokenWeightsAtom = atom<number[]>({
  key: 'tokenWeightsAtom',
  default: [],
})

const daoInitialBalanceAtom = atom<number>({
  key: 'daoInitialBalanceAtom',
  default: 0,
})

const passThresholdAtom = atom({
  key: 'proposalPassThreshold',
  default: 75,
})

const smallestVoteCartelSelector = selector({
  key: 'smallesVoteCartel',
  get: ({ get }) => {
    const threshold = get(passThresholdAtom) / 100
    const weights = get(tokenWeightsAtom)
    const dao = get(daoInitialBalanceAtom)

    const total = weights.reduce((p, n) => p + n, 0) + dao
    const shares = weights
      .map((w) => w / total)
      .sort()
      .reverse()

    let votePower = 0
    let votes = 0
    for (const share of shares) {
      votePower += share
      votes += 1
      if (votePower >= threshold) {
        return votes
      }
    }

    // Impossible to reach threshold
    return Infinity
  },
})

function MinorityRuleWarning({ memberCount }: { memberCount: number }) {
  const cartel = useRecoilValue(smallestVoteCartelSelector)
  const cartelPercent = (cartel / memberCount) * 100

  const warn = cartelPercent <= 20
  const localeOptions = { maximumSignificantDigits: 3 }

  if (warn) {
    return (
      <>
        <div className="outline outline-warning shadow-md rounded-lg w-full py-4 px-6 flex items-center">
          <div>
            <h3 className="font-mono text-sm">
              WARNING: Minority rule is possible
            </h3>
            <p className="text-sm mt-2">
              {cartelPercent.toLocaleString(undefined, localeOptions)}% of
              accounts could approve a proposal that the remaining{' '}
              {(100 - cartelPercent).toLocaleString(undefined, localeOptions)}%
              oppose.
            </p>
          </div>
        </div>

        <div className="outline outline-info shadow-md rounded-lg w-full py-4 px-6 flex items-center mt-3">
          <div>
            <h3 className="font-mono text-sm">
              <InformationCircleIcon className="h-4 w-4 inline mb-0.5 mr-2" />
              Tip
            </h3>
            <p className="text-sm mt-2">
              Consider{' '}
              <Link href="/multisig/create">
                <a className="link">creating a multisig</a>
              </Link>{' '}
              or allocating some tokens to the DAO.
            </p>
          </div>
        </div>
      </>
    )
  }
  return null
}

export function secondsToHms(seconds: string): string {
  const secondsInt = Number(seconds)
  const h = Math.floor(secondsInt / 3600)
  const m = Math.floor((secondsInt % 3600) / 60)
  const s = Math.floor((secondsInt % 3600) % 60)

  const hDisplay =
    h > 0 ? h + (h == 1 ? ' hr' : ' hrs') + (m > 0 || s > 0 ? ', ' : '') : ''
  const mDisplay =
    m > 0 ? m + (m == 1 ? ' min' : ' mins') + (s > 0 ? ', ' : '') : ''
  const sDisplay = s > 0 ? s + (s == 1 ? ' sec' : ' secs') : ''
  return hDisplay + mDisplay + sDisplay
}

const CreateDao: NextPage = () => {
  const router = useRouter()
  const { walletAddress, signingClient } = useSigningClient()
  const [count, setCount] = useState(1)
  const [contractAddress, _setContractAddress] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [votingPeriodSeconds, setVotingPeriodSeconds] = useState(
    DEFAULT_MAX_VOTING_PERIOD_SECONDS
  )
  const [unstakingDurationSeconds, setUnstakingDurationSeconds] = useState(
    DEFAULT_UNSTAKING_DURATION_SECONDS
  )

  const [tokenMode, setTokenMode] = useState(TokenMode.Create)

  // Maps address rows to their token weights. Used to surface
  // warnings about minority rule.
  const setTokenWeights = useSetRecoilState(tokenWeightsAtom)
  // Holds the threshold for a vote to pass as the form is being
  // filled out. Used to surface warnings about minority rule.
  const setPassThreshold = useSetRecoilState(passThresholdAtom)
  // Holds the initial balance of the DAO which needs to be treated
  // different than wallet balance in detecting problematic token
  // distributions.
  const setDaoInitialBalance = useSetRecoilState(daoInitialBalanceAtom)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    if (error) errorNotify(cleanChainError(error))
  }, [error])

  const onSubmit = (data: DaoCreateData) => {
    setError('')
    setLoading(true)
    function getStringValue(key: string): string {
      const val = data[key]
      if (typeof val === 'string') {
        return val.trim()
      }
      return ''
    }
    function getIntValue(key: string): number {
      return parseInt(getStringValue(key) || '0', 10)
    }
    function getIndexedValue(prefix: string, index: number): string {
      return getStringValue(`${prefix}_${index}`)
    }
    const owners = [...Array(count)].map((_item, index) => ({
      address: getIndexedValue('address', index),
      // Convert human readable amount to micro denom amount
      amount: convertDenomToMicroDenom(getIndexedValue('weight', index)),
    }))
    const threshold = getIntValue('threshold')
    const maxVotingPeriod = {
      time: getIntValue('duration'),
    }
    const unstakingDuration = {
      time: getIntValue('unstakingDuration'),
    }
    const refund =
      typeof data.refund === 'string'
        ? getIntValue('refund') === 1
        : !!data.refund

    const msg: InstantiateMsg =
      tokenMode == TokenMode.Create
        ? makeDaoInstantiateWithNewTokenMessage(
            data.name,
            data.description,
            data.tokenName,
            data.tokenSymbol,
            owners,
            convertDenomToMicroDenom(data.daoInitialBalance),
            threshold / 100, // Conversion to decimal percentage
            maxVotingPeriod,
            unstakingDuration,
            getIntValue('deposit') || 0,
            refund
          )
        : makeDaoInstantiateWithExistingTokenMessage(
            data.name,
            data.description,
            data.existingTokenAddress,
            threshold / 100, // Conversion to decimal percentage
            maxVotingPeriod,
            unstakingDuration,
            getIntValue('deposit') || 0,
            refund
          )

    console.log('instantiating DAO with message:')
    console.log(msg)

    if (!signingClient) {
      setLoading(false)
      setError('Wallet not connected')
      return
    }

    signingClient
      .instantiate(
        walletAddress,
        DAO_CODE_ID,
        msg,
        data.name,
        defaultExecuteFee
      )
      .then((response: InstantiateResult) => {
        setLoading(false)
        if (response.contractAddress.length > 0) {
          router.push(`/dao/${encodeURIComponent(response.contractAddress)}`)
        }

        successNotify('New DAO Created')
      })
      .catch((err: any) => {
        setLoading(false)
        setError(err.message)
        console.log(err.message)
      })
  }

  const complete = contractAddress.length > 0

  return (
    <div className="grid grid-cols-6">
      <div className="p-6 w-full col-span-4">
        <Breadcrumbs
          crumbs={[
            ['/dao/list', 'DAOs'],
            [router.asPath, 'Create DAO'],
          ]}
        />

        <form className="mb-8" onSubmit={handleSubmit<DaoCreateData>(onSubmit)}>
          <h2 className="mt-10 text-lg">
            <PaperClipIcon className="inline w-5 h-5 mr-2 mb-1" />
            Basic config
          </h2>
          <div className="px-3">
            <div className="form-control">
              <InputLabel name="Name" />
              <TextInput
                label="name"
                register={register}
                error={errors.name}
                validation={[validateRequired]}
              />
              <InputErrorMessage error={errors.name} />
            </div>

            <div className="form-control">
              <InputLabel name="Description" />
              <TextInput
                label="description"
                register={register}
                error={errors.description}
                validation={[validateRequired]}
              />
              <InputErrorMessage error={errors.description} />
            </div>
          </div>

          <div className="tabs mt-8">
            <button
              className={
                'tab tab-lifted tab-lg' +
                (tokenMode == TokenMode.Create ? ' tab-active' : '')
              }
              onClick={() => setTokenMode(TokenMode.Create)}
              type="button"
            >
              Create new token
            </button>
            <button
              className={
                'tab tab-lifted tab-lg' +
                (tokenMode == TokenMode.UseExisting ? ' tab-active' : '')
              }
              onClick={() => setTokenMode(TokenMode.UseExisting)}
              type="button"
            >
              Use existing token
            </button>
            <div className="flex-1 cursor-default tab tab-lifted"></div>
          </div>

          <div className="border-r border-b border-l border-solid p-3 border-base-300 rounded-b-lg">
            {tokenMode == TokenMode.Create ? (
              <>
                <div className="form-control">
                  <InputLabel name="Token Name" />
                  <TextInput
                    label="tokenName"
                    register={register}
                    error={errors.tokenName}
                    validation={[isValidName]}
                  />
                  <InputErrorMessage error={errors.tokenName} />
                </div>

                <div className="form-control">
                  <InputLabel name="Token Symbol" />
                  <TextInput
                    label="tokenSymbol"
                    register={register}
                    error={errors.tokenSymbol}
                    validation={[isValidTicker]}
                  />
                  <InputErrorMessage error={errors.tokenSymbol} />
                </div>

                <h2 className="mt-8 mb-2 text-lg">Token distribution</h2>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="form-control col-span-1">
                    <InputLabel name="DAO initial balance" />
                    <NumberInput
                      label="daoInitialBalance"
                      register={register}
                      error={errors.daoInitialBalance}
                      validation={[validateRequired, validatePositive]}
                      defaultValue="0"
                      onChange={(e) => {
                        const val = e?.target?.value
                        setDaoInitialBalance(Number(val))
                      }}
                    />
                    <InputErrorMessage error={errors.daoInitialBalance} />
                  </div>
                  <div className="col-span-2"></div>

                  <h3 className="label-text col-span-2 text-secondary">
                    Address
                  </h3>
                  <h3 className="label-text text-secondary">Amount</h3>
                </div>
                <ul className="list-none">
                  {[...Array(count).keys()].map((idx) => {
                    // These labels are later used in conjunction
                    // with `count` to extract the input addresses
                    // and weights.
                    const addressLabel = `address_${idx}`
                    const weightLabel = `weight_${idx}`

                    return (
                      <li key={idx} className="grid grid-cols-3 gap-2 my-2">
                        <div className="form-control col-span-2">
                          <TextInput
                            label={addressLabel}
                            register={register}
                            error={errors[addressLabel]}
                            validation={[validateAddress, validateRequired]}
                          />
                          <InputErrorMessage error={errors[addressLabel]} />
                        </div>
                        <div className="form-control">
                          <NumberInput
                            label={weightLabel}
                            register={register}
                            error={errors[weightLabel]}
                            validation={[validateRequired, validatePositive]}
                            defaultValue="1"
                            onChange={(e) => {
                              const val = e?.target?.value
                              setTokenWeights((weights) => {
                                const newWeights = [...weights]
                                while (idx >= newWeights.length) {
                                  newWeights.push(1)
                                }
                                newWeights[idx] = Number(val)
                                return newWeights
                              })
                            }}
                          />
                          <InputErrorMessage error={errors[weightLabel]} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div className="btn-group">
                  <button
                    className="btn btn-outline btn-sm text-md normal-case"
                    onClick={(e) => {
                      e.preventDefault()
                      setCount(count + 1)
                      setTokenWeights((weights) => {
                        const newWeights = [...weights, 1]
                        return newWeights
                      })
                    }}
                  >
                    +
                  </button>
                  <button
                    className={
                      'btn btn-outline btn-primary btn-sm text-md normal-case' +
                      (count <= 1 ? ' btn-disabled btn-secondary' : '')
                    }
                    onClick={(e) => {
                      e.preventDefault()
                      setCount(count - 1)
                      setTokenWeights((weights) => {
                        const newWeights = [...weights]
                        newWeights.pop()
                        return newWeights
                      })
                    }}
                  >
                    -
                  </button>
                </div>
              </>
            ) : (
              <div className="form-control">
                <InputLabel name="Existing token address" />
                <TextInput
                  label="existingTokenAddress"
                  register={register}
                  error={errors.existingTokenAddress}
                  validation={[validateAddress, validateRequired]}
                />
                <InputErrorMessage error={errors.existingTokenAddress} />
              </div>
            )}
          </div>

          <h2 className="mt-8 text-lg">
            <ScaleIcon className="inline w-5 h-5 mr-2 mb-1" />
            Voting Config
          </h2>
          <div className="grid grid-cols-2 gap-x-3 mb-8 px-3 mt-1">
            <div className="form-control">
              <InputLabel name="Passing Threshold (%)" />
              <NumberInput
                label="threshold"
                register={register}
                error={errors.threshold}
                validation={[validateRequired, validatePercent]}
                defaultValue="75"
                onChange={(e) => setPassThreshold(Number(e?.target?.value))}
              />
              <InputErrorMessage error={errors.threshold} />
            </div>

            <div className="form-control">
              <InputLabel name="Voting Duration (seconds)" />
              <NumberInput
                label="duration"
                register={register}
                error={errors.duration}
                validation={[validateRequired, validatePositive]}
                onChange={(e) => setVotingPeriodSeconds(e?.target?.value)}
                defaultValue={DEFAULT_MAX_VOTING_PERIOD_SECONDS}
              />
              <InputErrorMessage error={errors.duration} />
              <div
                style={{
                  textAlign: 'end',
                  padding: '5px 0 0 17px',
                  fontSize: ' 12px',
                  color: 'grey',
                }}
              >
                {secondsToHms(votingPeriodSeconds)}
              </div>
            </div>

            <div className="form-control">
              <InputLabel name="Proposal Deposit" />
              <NumberInput
                label="deposit"
                register={register}
                error={errors.deposit}
                validation={[validateRequired]}
                defaultValue="0"
              />
              <InputErrorMessage error={errors.deposit} />
            </div>

            <div className="form-control">
              <InputLabel name="Unstaking Duration (seconds)" />
              <NumberInput
                label="unstakingDuration"
                register={register}
                error={errors.unstakingDuration}
                validation={[validateRequired]}
                onChange={(e) => setUnstakingDurationSeconds(e?.target?.value)}
                defaultValue={DEFAULT_UNSTAKING_DURATION_SECONDS}
              />
              <InputErrorMessage error={errors.unstakingDuration} />
              <div
                style={{
                  textAlign: 'end',
                  padding: '5px 0 0 17px',
                  fontSize: ' 12px',
                  color: 'grey',
                }}
              >
                {secondsToHms(unstakingDurationSeconds)}
              </div>
            </div>

            <div className="form-control">
              <InputLabel name="Refund Proposal Deposits" />
              <ToggleInput label="refund" register={register} />
              <InputErrorMessage error={errors.refund} />
            </div>
          </div>
          {!complete && (
            <button
              className={`mt-3 w-44 btn btn-primary btn-md font-semibold normal-case hover:text-base-100 text-lg ${
                loading ? 'loading' : ''
              }`}
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
              type="submit"
              disabled={loading}
            >
              Create DAO
            </button>
          )}
        </form>
      </div>

      <div className="col-span-2">
        <div className="sticky top-0 p-6 w-full">
          <MinorityRuleWarning memberCount={count} />
        </div>
      </div>
    </div>
  )
}

export default CreateDao
