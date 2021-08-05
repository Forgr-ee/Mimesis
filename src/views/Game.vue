<template>
  <ion-page>
    <ion-content :fullscreen="true">
        Game
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonPage } from "@ionic/vue";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "Game",
  components: {
    IonContent,
    IonPage,
  },
  data() {
    return {
    //   themes: [] as Theme[],
    //   offline: true,
    };
  },
  async mounted() {
    // this.themes = (await getStorage("themes", [])) as Theme[];
  },
  methods: {
  },
  setup() {
    const router = useRouter();
    return { router };
  },
});
</script>
