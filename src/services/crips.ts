import { isPlatform } from '@ionic/vue'

declare global {
  interface Window {
    $crisp: unknown[]
    CRISP_WEBSITE_ID: string
  }
}

export const initCrisp = (): void => {
  try {
    if (isPlatform('capacitor')) {
      window.$crisp = [
        ['safe', true],
        ['do', 'chat:hide'],
        [
          'on',
          'chat:closed',
          () => {
            window.$crisp.push(['do', 'chat:hide'])
          },
        ],
        [
          'on',
          'message:received',
          () => {
            window.$crisp.push(['do', 'chat:show'])
          },
        ],
      ]
    } else {
      window.$crisp = []
    }
    window.CRISP_WEBSITE_ID = '1011b75e-c4f6-400c-a6ff-c5077adb9db3'
    const s = document.createElement('script')
    s.src = 'https://client.crisp.chat/l.js'
    s.async = true
    document.getElementsByTagName('head')[0].appendChild(s)
  } catch (e) {
    console.error('Crips cannot be init', e)
  }
}
