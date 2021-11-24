import { NativeAudio } from 'capacitor-native-audio'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar } from '@capacitor/status-bar'
import { isPlatform } from '@ionic/vue'
import { App } from '@capacitor/app'
import { CapacitorUpdater } from 'capacitor-updater'
import { useMainStore } from '@/store/main'

export const initCapacitor = (): void => {
  if (isPlatform('capacitor')) {
    const main = useMainStore()
    App.addListener('appStateChange', async (state) => {
      if (!state.isActive && !main.lastVersion.updated) {
        SplashScreen.show()
        await CapacitorUpdater.set({ version: main.lastVersion.folder })
        SplashScreen.hide() // in case set fail, otherwise the new app will have to hide it
      }
    })
    StatusBar.hide()

    NativeAudio.preload({
      assetPath: 'tada.mp3',
      assetId: 'tada',
      audioChannelNum: 1,
      isUrl: false,
    })
    NativeAudio.preload({
      assetPath: 'horn.mp3',
      assetId: 'horn',
      audioChannelNum: 1,
      isUrl: false,
    })
    SplashScreen.hide()
  }
}
