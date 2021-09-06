import { IAPProduct, InAppPurchase2 } from '@ionic-native/in-app-purchase-2';
import { isPlatform } from '@ionic/vue'

export interface IAPProductCustom {
    status: 'paid' | 'free'
    id_ios: string
    id_android: string
}

export const restore = () => {
    if (isPlatform('capacitor')) {
        console.log("restore");
        InAppPurchase2.refresh();
    }
}

export const listenBuy = (product: IAPProduct): Promise<IAPProduct> => {
    return new Promise((resolve) => {
        InAppPurchase2.when(product.id)
            .owned((p: IAPProduct) => {
                resolve(p);
            })
            .approved((p: IAPProduct) => p.finish());
    });
}

export const listenCancel = (product: IAPProduct): Promise<IAPProduct> => {
    return new Promise((resolve) => {
        InAppPurchase2.when(product.id)
            .cancelled((p: IAPProduct) => {
                resolve(p);
            })
            .approved((p: IAPProduct) => p.finish());
    });
}

export const purchase = (product: IAPProduct): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (isPlatform('capacitor')) {
            InAppPurchase2.order(product).then((p: IAPProduct) => {
                resolve()
            }).error((e: any) => {
                console.error(`Failed to purchase: ${e}`);
                reject(e)
            })
        } else {
            console.log("purchase web", product)
            resolve()
        }
    })
}

export const registerProduct = (p: IAPProductCustom): Promise<IAPProduct | undefined> => {
    return new Promise((resolve) => {
            if (isPlatform('capacitor') && p.status === "paid") {
                InAppPurchase2.when(isPlatform('ios') ? p.id_ios : p.id_android)
                .registered((product: IAPProduct) => {
                    resolve(product)
                })
                InAppPurchase2.register({
                    id: isPlatform('ios') ? p.id_ios : p.id_android,
                    type: InAppPurchase2.NON_CONSUMABLE,
                })
            } else {
                resolve(undefined)
            }
    })
}