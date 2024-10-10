import { UserType } from './IUser'

export enum AlignmentOptions {
  left = 'LEFT',
  right = 'RIGHT',
  mid = 'MID',
}

export enum PricingPlanType {
  BASIC = 'basic',
  GROWTH = 'growth',
  VOLUME = 'volume',
  ENTERPRISE = 'enterprise',
}

export enum ExchangeRateInterval {
  day = 'day',
  hour = 'hour',
  minute = 'minute'
}

export function getPlanDetails (planType: PricingPlanType) {
  if (planType === PricingPlanType.BASIC) {
    return {
      perMonthTransactionLimit: 50,
      historicalDataImportLimit: 1,
      cryptocurrencyPricingGranularity: ExchangeRateInterval.day
    }
  }

  if (planType === PricingPlanType.GROWTH) {
    return {
      perMonthTransactionLimit: 2000,
      historicalDataImportLimit: 12,
      cryptocurrencyPricingGranularity: ExchangeRateInterval.day
    }
  }

  if (planType === PricingPlanType.VOLUME) {
    return {
      perMonthTransactionLimit: 20000,
      historicalDataImportLimit: 24,
      cryptocurrencyPricingGranularity: ExchangeRateInterval.day
    }
  }

  throw new Error('Unsupported pricing plan')
}

export interface NumberSetting {
  precision: number // The number of digits in a number
  scale: number // The number of digits to the right of the decimal point in a number
  alignment: AlignmentOptions // alignment of the number
}

export enum ExchangeRateType {
  openingRate = 'opening-rate',
  closingRate = 'closing-rate'
}

export interface Company {
  id?: string
  companyName?: string
  industry: string
  country: string
  timeZone: string
  address?: string
  isActive?: boolean
}
