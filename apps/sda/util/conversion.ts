import {
  Duration,
  Expiration,
  Threshold as DaoThreshold,
  ThresholdResponse,
} from '@dao-dao/types/contracts/cw3-dao'

import { NATIVE_DECIMALS, NATIVE_DENOM } from './constants'
import ibcAssets from './ibc_assets.json'

export function convertMicroDenomToDenomWithDecimals(
  amount: number | string,
  decimals: number
) {
  if (typeof amount === 'string') {
    amount = Number(amount)
  }
  amount = amount / Math.pow(10, decimals)
  return isNaN(amount) ? 0 : amount
}

export function convertDenomToMicroDenomWithDecimals(
  amount: number | string,
  decimals: number
): string {
  if (typeof amount === 'string') {
    amount = Number(amount)
  }
  amount = amount * Math.pow(10, decimals)
  return isNaN(amount) ? '0' : String(amount)
}

export function convertFromMicroDenom(denom: string) {
  return denom?.substring(1).toUpperCase()
}

export function convertToFixedDecimals(amount: number | string): string {
  if (typeof amount === 'string') {
    amount = Number(amount)
  }
  if (amount > 0.01) {
    return amount.toFixed(2)
  } else return String(amount)
}

export function convertDenomToHumanReadableDenom(denom: string): string {
  if (denom.startsWith('u')) {
    return denom.substring(1)
  }
  return denom
}

export function convertDenomToContractReadableDenom(denom: string): string {
  if (denom.startsWith('u')) {
    return denom
  }
  return 'u' + denom
}

export const zeroVotingCoin = {
  amount: '0',
  denom: 'ucredits',
}

export const zeroStakingCoin = {
  amount: '0',
  denom: process.env.NEXT_PUBLIC_STAKING_DENOM || 'ujuno',
}

export const getDaoThresholdAndQuorum = (
  t: DaoThreshold
): { threshold: string | undefined; quorum: string | undefined } => {
  let threshold = undefined
  let quorum = undefined

  if ('absolute_percentage' in t) {
    threshold = (Number(t.absolute_percentage.percentage) * 100).toString()
  } else if ('threshold_quorum' in t) {
    threshold = (Number(t.threshold_quorum.threshold) * 100).toString()
    quorum = (Number(t.threshold_quorum.quorum) * 100).toString()
  }

  return { threshold, quorum }
}

export const getThresholdAndQuorumDisplay = (
  t: ThresholdResponse | DaoThreshold,
  tokenDecimals: number
): [string, string | undefined] => {
  if ('absolute_count' in t) {
    const count = Number(t.absolute_count.weight)
    return [
      `${convertMicroDenomToDenomWithDecimals(count, tokenDecimals)} vote${
        count !== 1 ? 's' : ''
      }`,
      undefined,
    ]
  } else if ('absolute_percentage' in t) {
    const threshold = t.absolute_percentage.percentage
    return [`${Number(threshold) * 100}%`, undefined]
  } else if ('threshold_quorum' in t) {
    const quorum = t.threshold_quorum.quorum
    const threshold = t.threshold_quorum.threshold
    return [`${Number(threshold) * 100}%`, `${Number(quorum) * 100}%`]
  }
  return ['unknown', 'unknown']
}

export const thresholdString = (
  t: ThresholdResponse | DaoThreshold,
  tokenDecimals: number
) => {
  if ('absolute_count' in t) {
    const count = Number(t.absolute_count.weight)
    return `${convertMicroDenomToDenomWithDecimals(count, tokenDecimals)} vote${
      count !== 1 ? 's' : ''
    }`
  } else if ('absolute_percentage' in t) {
    const threshold = t.absolute_percentage.percentage
    return `${Number(threshold) * 100}%`
  } else if ('threshold_quorum' in t) {
    const quorum = t.threshold_quorum.quorum
    const threshold = t.threshold_quorum.threshold
    return `${quorum}% quorum; ${threshold}% threshold`
  } else {
    return 'unknown'
  }
}

export function humanReadableDuration(d: Duration) {
  if ('height' in d) {
    return `${d.height} blocks`
  }
  if (d.time == 0) {
    return '0 seconds'
  }
  return `${secondsToWdhms(d.time.toString())}`
}

const secPerDay = 24 * 60 * 60
export function secondsToWdhms(seconds: string | number, numUnits = 5): string {
  const secondsInt = Number(seconds)
  const w = Math.floor(secondsInt / (secPerDay * 7))
  const d = Math.floor((secondsInt % (secPerDay * 7)) / secPerDay)
  const h = Math.floor((secondsInt % secPerDay) / 3600)
  const m = Math.floor((secondsInt % 3600) / 60)
  const s = Math.floor(secondsInt % 60)

  const wDisplay = w ? w + (w === 1 ? ' wk' : ' wks') : null
  const dDisplay = d ? d + (d === 1 ? ' day' : ' days') : null
  const hDisplay = h ? h + (h === 1 ? ' hr' : ' hrs') : null
  const mDisplay = m ? m + (m === 1 ? ' min' : ' mins') : null
  const sDisplay = s ? s + (s === 1 ? ' sec' : ' secs') : null

  return (
    [wDisplay, dDisplay, hDisplay, mDisplay, sDisplay]
      // Ignore empty values.
      .filter(Boolean)
      // Only keep certain precision of units.
      .slice(0, numUnits)
      // Separate with commas.
      .join(', ')
  )
}

export function nativeTokenLabel(denom: string): string {
  // Search IBC asset strings (junoDenom) if denom is in IBC format.
  // Otherwise just check microdenoms.
  const asset = denom.startsWith('ibc')
    ? ibcAssets.tokens.find(({ junoDenom }) => junoDenom === denom)
    : ibcAssets.tokens.find(({ denom: d }) => d === denom)
  // If no asset, assume it's already a microdenom.
  return asset?.symbol || convertFromMicroDenom(denom)
}

export function nativeTokenLogoURI(denom: string): string | undefined {
  if (denom === 'ujuno' || denom == 'ujunox') {
    return '/juno-symbol.png'
  }

  const asset = denom.startsWith('ibc')
    ? ibcAssets.tokens.find(({ junoDenom }) => junoDenom === denom)
    : ibcAssets.tokens.find(({ denom: d }) => d === denom)
  return asset?.logoURI
}

export function nativeTokenDecimals(denom: string): number | undefined {
  if (denom === NATIVE_DENOM) {
    return NATIVE_DECIMALS
  }
  const asset = denom.startsWith('ibc')
    ? ibcAssets.tokens.find(({ junoDenom }) => junoDenom === denom)
    : ibcAssets.tokens.find(({ denom: d }) => d === denom)
  return asset?.decimals
}

export const expirationAtTimeToSecondsFromNow = (exp: Expiration) => {
  if (!('at_time' in exp)) {
    return undefined
  }

  const end = Number(exp['at_time'])
  const nowSeconds = new Date().getTime() / 1000
  const endSeconds = end / 1000000000

  return endSeconds - nowSeconds
}
