import { NativeAudio } from 'capacitor-native-audio'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar } from '@capacitor/status-bar'
import { isPlatform } from '@ionic/vue'
// import { App } from '@capacitor/app'
// import { CapacitorUpdater } from 'capacitor-updater'

export const initCapacitor = (): void => {
  if (isPlatform('capacitor')) {
    // Do the update when user lean app
    // App.addListener('appStateChange', async (state) => {
    //   if (!state.isActive) {
    //     SplashScreen.show()
    //     const version = await CapacitorUpdater.download({
    //       url: 'https://github.com/Forgr-ee/Mimesis/releases/download/0.0.1/dist.zip',
    //     })
    //     await CapacitorUpdater.set(version)
    //     SplashScreen.hide() // in case the set fail, otherwise the new app will have to hide it
    //   }
    // })
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
