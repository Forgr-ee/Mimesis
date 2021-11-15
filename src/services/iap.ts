import {
  PurchaserInfo,
  Purchases,
  PurchasesOffering,
  PurchasesPackage,
} from '@ionic-native/purchases'
import { isPlatform } from '@ionic/vue'

export interface IAPProductCustom {
  status: 'paid' | 'free'
  id_ios: string
  id_android: string
}

export const initIap = (id: string) => {
  if (isPlatform('capacitor')) {
    Purchases.setDebugLogsEnabled(import.meta.env.DEV) // Enable to get debug logs in dev mode
    Purchases.setup(id)
  }
}

export const restore = async (): Promise<PurchaserInfo | null> => {
  if (isPlatform('capacitor')) {
    const res = await Purchases.restoreTransactions()
    console.log('restore', res)
    return res
  }
  return null
}

export const purchase = async (
  p: PurchasesPackage
): Promise<PurchaserInfo | false> => {
  try {
    const product = await Purchases.purchasePackage(p)
    console.log('listenBuy', product)
    if (
      typeof product.purchaserInfo.entitlements.active
        .my_entitlement_identifier !== 'undefined'
    ) {
      return product.purchaserInfo
    }
  } catch (e) {
    console.error('listenBuy error', e)
  }
  return false
}

export const getCurrentOfferings =
  async (): Promise<PurchasesOffering | null> => {
    const offerings = await Purchases.getOfferings()
    return offerings.current
  }

export const findProduct = async (
  productId: string
): Promise<PurchasesPackage | null> => {
  const offering = await getCurrentOfferings()
  offering?.availablePackages.forEach((p) => {
    if (p.identifier === productId) {
      return p
    }
  })
  return null
}

export const isPurchased = (
  productId: string | undefined,
  pInfo: PurchaserInfo | null
): boolean => {
  if (pInfo && productId) {
    pInfo.allPurchasedProductIdentifiers.forEach((p) => {
      if (p === productId) {
        return true
      }
    })
  }
  return false
}
