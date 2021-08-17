import { NativeAudio } from '@capacitor-community/native-audio';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { isPlatform } from '@ionic/vue';

export const initCapacitor = () => {
    if (isPlatform("capacitor")) {
      StatusBar.hide();
      NativeAudio.preload({
        assetPath: "tada.mp3",
        assetId: "tada",
        audioChannelNum: 1,
        isUrl: false,
      });
      NativeAudio.preload({
          assetPath: "horn.mp3",
          assetId: "horn",
          audioChannelNum: 1,
          isUrl: false,
      });
      SplashScreen.hide();
    }
  };