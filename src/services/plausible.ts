import Plausible from 'plausible-tracker'
import { isPlatform } from '@ionic/vue'

export const trackEvent = (eventName: string, eventData: any = {}) => {
  const { trackEvent } = Plausible({
    trackLocalhost: isPlatform('capacitor'),
    domain: import.meta.env.domain as string,
  })
  trackEvent(eventName, { props: eventData })
}

export const initPlausible = (): void => {
  const { enableAutoPageviews } = Plausible({
    trackLocalhost: isPlatform('capacitor'),
    domain: import.meta.env.domain as string,
  })
  enableAutoPageviews()
}
