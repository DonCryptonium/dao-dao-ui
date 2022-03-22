import React, { useEffect, useState } from 'react'

import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'

import {
  atom,
  selector,
  useRecoilValue,
  useRecoilState,
  useSetRecoilState,
} from 'recoil'

import { InstantiateResult } from '@cosmjs/cosmwasm-stargate'
import { TokenInfoResponse } from '@dao-dao/types/contracts/cw20-gov'
import { InstantiateMsg } from '@dao-dao/types/contracts/cw3-dao'
import { InformationCircleIcon, ScaleIcon } from '@heroicons/react/outline'
import { useForm, Validate } from 'react-hook-form'

import { InputErrorMessage } from '@components/input/InputErrorMessage'
import { InputLabel } from '@components/input/InputLabel'
import { NumberInput } from '@components/input/NumberInput'
import { TextInput } from '@components/input/TextInput'
import { ToggleInput } from '@components/input/ToggleInput'
import { PlusMinusButton } from '@components/PlusMinusButton'
import TooltipsDisplay, {
  useTooltipsRegister,
} from '@components/TooltipsDisplay'
import { pinnedDaosAtom } from 'atoms/pinned'
import { Breadcrumbs } from 'components/Breadcrumbs'
import {
  daoCreateTooltipsGetter,
  daoCreateTooltipsDefault,
} from 'components/TooltipsDisplay/daoCreate'
import {
  cosmWasmSigningClient,
  walletAddress as walletAddressSelector,
} from 'selectors/cosm'
import { cleanChainError } from 'util/cleanChainError'
import { DAO_CODE_ID, NATIVE_DECIMALS } from 'util/constants'
import {
  convertDenomToMicroDenomWithDecimals,
  secondsToHms,
} from 'util/conversion'
import {
  validateAddress,
  validateContractAddress,
  validateNonNegative,
  validatePercent,
  validatePositive,
  validateRequired,
  validateUrl,
} from 'util/formValidation'
import { isValidName, isValidTicker } from 'util/isValidTicker'
import {
  makeDaoInstantiateWithExistingTokenMessage,
  makeDaoInstantiateWithNewTokenMessage,
} from 'util/messagehelpers'
import { errorNotify, successNotify } from 'util/toast'

export interface DaoCreateData {
  deposit: string
  description: string
  duration: string

  // The `tokenMode` state varaible inside of `CreateDAO` determines
  // which of these fields we use to instantiate the DAO.

  // Fields for creating a DAO with a new token.
  name: string

  threshold: string
  // Quorum if the threshold quorum passing threshold type is selected. Consult
  // `ThresholdMode` to determine if this type is selected.
  quorum: string

  tokenName: string
  tokenSymbol: string
  daoInitialBalance: string

  // Field for creating a DAO with an existing token.
  existingTokenAddress: string

  unstakingDuration: string
  refund: string | boolean
  imageUrl: string
  [key: string]: string | boolean
}

export const DEFAULT_MAX_VOTING_PERIOD_SECONDS = '604800'
export const DEFAULT_UNSTAKING_DURATION_SECONDS = '0' // 12 hours

enum TokenMode {
  UseExisting,
  Create,
}

enum ThresholdMode {
  Threshold,
  ThresholdQuorum,
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
  default: 51,
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

const CreateDao: NextPage = () => {
  const router = useRouter()
  const walletAddress = useRecoilValue(walletAddressSelector)
  const signingClient = useRecoilValue(cosmWasmSigningClient)

  const [count, setCount] = useState(1)
  const [contractAddress, _setContractAddress] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    watch,
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<DaoCreateData>()

  const [selectedTooltip, register] = useTooltipsRegister(
    formRegister,
    daoCreateTooltipsGetter,
    daoCreateTooltipsDefault
  )

  const votingPeriodSeconds = watch('duration')
  const unstakingDurationSeconds = watch('unstakingDuration')

  const [tokenMode, setTokenMode] = useState(TokenMode.Create)
  const [thresholdMode, setThresholdMode] = useState(
    ThresholdMode.ThresholdQuorum
  )

  // Maps address rows to their token weights. Used to surface
  // warnings about minority rule.
  const [tokenWeights, setTokenWeights] = useRecoilState(tokenWeightsAtom)

  // Holds the threshold for a vote to pass as the form is being
  // filled out. Used to surface warnings about minority rule.
  const setPassThreshold = useSetRecoilState(passThresholdAtom)
  // Holds the initial balance of the DAO which needs to be treated
  // different than wallet balance in detecting problematic token
  // distributions.
  const [daoInitialBalance, setDaoInitialBalance] = useRecoilState(
    daoInitialBalanceAtom
  )

  // Total supply
  const totalTokenSupply =
    daoInitialBalance +
    tokenWeights.reduce((accum, weight) => accum + weight, 0)

  const setPinnedDaos = useSetRecoilState(pinnedDaosAtom)

  useEffect(() => {
    if (error) errorNotify(cleanChainError(error))
  }, [error])

  const onSubmit = async (data: DaoCreateData) => {
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
      amount: convertDenomToMicroDenomWithDecimals(
        getIndexedValue('weight', index),
        NATIVE_DECIMALS
      ),
    }))
    const threshold = getIntValue('threshold')
    const quorum = getIntValue('quorum')
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

    const imgUrl = data.imageUrl !== '' ? data.imageUrl : undefined
    let tokenDecimals = 6
    if (tokenMode == TokenMode.UseExisting) {
      const tokenInfo = (await signingClient?.queryContractSmart(
        data.existingTokenAddress,
        {
          token_info: {},
        }
      )) as TokenInfoResponse
      tokenDecimals = tokenInfo.decimals
    }
    const proposalDeposit = convertDenomToMicroDenomWithDecimals(
      getIntValue('deposit') || 0,
      tokenDecimals
    )

    const msg =
      tokenMode == TokenMode.Create
        ? makeDaoInstantiateWithNewTokenMessage(
            data.name,
            data.description,
            data.tokenName,
            data.tokenSymbol,
            owners,
            convertDenomToMicroDenomWithDecimals(
              data.daoInitialBalance,
              NATIVE_DECIMALS
            ),
            threshold / 100, // Conversion to decimal percentage
            thresholdMode === ThresholdMode.ThresholdQuorum
              ? quorum / 100
              : undefined,
            maxVotingPeriod,
            unstakingDuration,
            proposalDeposit,
            refund,
            imgUrl
          )
        : makeDaoInstantiateWithExistingTokenMessage(
            data.name,
            data.description,
            data.existingTokenAddress,
            threshold / 100, // Conversion to decimal percentage
            thresholdMode === ThresholdMode.ThresholdQuorum
              ? quorum / 100
              : undefined,
            maxVotingPeriod,
            unstakingDuration,
            proposalDeposit,
            refund,
            imgUrl
          )

    console.log('instantiating DAO with message:')
    console.log(msg)

    if (!signingClient || !walletAddress) {
      setLoading(false)
      setError('Wallet not connected')
      return
    }

    signingClient
      .instantiate(
        walletAddress,
        Number(process.env.NEXT_PUBLIC_GOVERNANCE_CODE_ID),
        msg,
        data.name,
        'auto'
      )
      .then((response: InstantiateResult) => {
        setLoading(false)
        if (response.contractAddress.length > 0) {
          setPinnedDaos((p) => {
            const daos = p.concat([response.contractAddress])
            console.log(`setting pinned DAOS: (${daos})`)
            console.log(daos)
            return daos
          })
          router.push(
            `/dao/${encodeURIComponent(
              response.contractAddress
            )}?add_token=true`
          )
        }

        successNotify('New DAO Created')
      })
      .catch((err: any) => {
        console.log('le error')
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
            ['/starred', 'Home'],
            [router.asPath, 'Create DAO'],
          ]}
        />

        <form className="mb-8" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="pl-4 mt-10 text-lg">Name and description</h2>
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

            <div className="form-control">
              <InputLabel name="Image URL (optional)" />
              <TextInput
                label="imageUrl"
                register={register}
                error={errors.imageUrl}
                validation={[validateUrl]}
              />
              <InputErrorMessage error={errors.imageUrl} />
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
                  <div className="col-span-3">
                    <div className="flex flex-row justify-between">
                      <div className="form-control">
                        <InputLabel name="Initial treasury balance" />
                        <NumberInput
                          label="daoInitialBalance"
                          register={register}
                          error={errors.daoInitialBalance}
                          validation={[validateRequired, validateNonNegative]}
                          defaultValue="0"
                          step={0.000001}
                          onChange={(e) => {
                            const val = e?.target?.value
                            setDaoInitialBalance(Number(val))
                          }}
                        />
                        <InputErrorMessage error={errors.daoInitialBalance} />
                      </div>
                      <div className="flex flex-col flex-end items-end">
                        <InputLabel name="Total token supply" />
                        <div className="w-min">
                          {totalTokenSupply.toLocaleString(undefined)}
                        </div>
                      </div>
                    </div>
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
                            validation={[
                              validateAddress as Validate<string | boolean>,
                              validateRequired,
                            ]}
                          />
                          <InputErrorMessage error={errors[addressLabel]} />
                        </div>
                        <div className="form-control">
                          <NumberInput
                            label={weightLabel}
                            register={register}
                            error={errors[weightLabel]}
                            validation={[
                              validateRequired,
                              validatePositive as Validate<string | boolean>,
                            ]}
                            defaultValue="1"
                            step={0.000001}
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
                <PlusMinusButton
                  onPlus={() => {
                    setCount(count + 1)
                    setTokenWeights((weights) => {
                      const newWeights = [...weights, 1]
                      return newWeights
                    })
                  }}
                  onMinus={() => {
                    setCount(count - 1)
                    setTokenWeights((weights) => {
                      const newWeights = [...weights]
                      newWeights.pop()
                      return newWeights
                    })
                  }}
                  disableMinus={count <= 1}
                />
              </>
            ) : (
              <div className="form-control">
                <InputLabel name="Existing token address" />
                <TextInput
                  label="existingTokenAddress"
                  register={register}
                  error={errors.existingTokenAddress}
                  validation={[validateContractAddress, validateRequired]}
                />
                <InputErrorMessage error={errors.existingTokenAddress} />
              </div>
            )}
          </div>

          <h2 className="mt-8 text-lg">
            <ScaleIcon className="inline w-5 h-5 mr-2 mb-1" />
            Voting configuration
          </h2>

          <div className="tabs mt-8 mx-3">
            <button
              className={
                'tab tab-lifted tab-lg' +
                (thresholdMode == ThresholdMode.ThresholdQuorum
                  ? ' tab-active'
                  : '')
              }
              onClick={() => setThresholdMode(ThresholdMode.ThresholdQuorum)}
              type="button"
            >
              Threshold and quorum
            </button>
            <button
              className={
                'tab tab-lifted tab-lg' +
                (thresholdMode == ThresholdMode.Threshold ? ' tab-active' : '')
              }
              onClick={() => setThresholdMode(ThresholdMode.Threshold)}
              type="button"
            >
              Absolute threshold
            </button>
            <div className="flex-1 cursor-default tab tab-lifted"></div>
          </div>

          <div className="mx-3 border-r border-b border-l border-solid p-3 border-base-300 rounded-b-lg">
            {thresholdMode == ThresholdMode.ThresholdQuorum ? (
              <div className="grid grid-cols-2 gap-x-3">
                <div className="form-control">
                  <InputLabel name="Passing Threshold (%)" />
                  <NumberInput
                    label="threshold"
                    register={register}
                    error={errors.threshold}
                    validation={[validateRequired, validatePercent]}
                    defaultValue="51"
                    step="any"
                    onChange={(e) => setPassThreshold(Number(e?.target?.value))}
                  />
                  <InputErrorMessage error={errors.threshold} />
                </div>
                <div className="form-control">
                  <InputLabel name="Quorum (%)" />
                  <NumberInput
                    label="quorum"
                    register={register}
                    error={errors.quorum}
                    validation={[validateRequired, validatePercent]}
                    defaultValue="33"
                    step="any"
                  />
                  <InputErrorMessage error={errors.quorum} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3">
                <div className="form-control">
                  <InputLabel name="Passing Threshold (%)" />
                  <NumberInput
                    label="threshold"
                    register={register}
                    error={errors.threshold}
                    validation={[validateRequired, validatePercent]}
                    defaultValue="51"
                    step="any"
                    onChange={(e) => setPassThreshold(Number(e?.target?.value))}
                  />
                  <InputErrorMessage error={errors.threshold} />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-3 mb-8 px-3 mt-1">
            <div className="form-control">
              <InputLabel name="Voting Duration (seconds)" />
              <NumberInput
                label="duration"
                register={register}
                error={errors.duration}
                validation={[validateRequired, validatePositive]}
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
                step={0.000001}
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
              <InputLabel name="Refund Failed Proposal Deposits" />
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
          <TooltipsDisplay selected={selectedTooltip} />
        </div>
      </div>
    </div>
  )
}

export default CreateDao
