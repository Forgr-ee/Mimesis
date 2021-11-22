import { CapacitorCrisp } from 'capacitor-crisp'

export const setUserId = (uuid: string): void => {
  CapacitorCrisp.setString({ key: 'user-uuid', value: uuid })
}
export const openChat = (): void => {
  CapacitorCrisp.openMessenger()
}
export const initCrisp = (): void => {
  try {
    CapacitorCrisp.configure({
      websiteID: '1011b75e-c4f6-400c-a6ff-c5077adb9db3',
    })
  } catch (e) {
    console.error('Crips cannot be init', e)
  }
}
