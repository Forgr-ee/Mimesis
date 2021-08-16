<template>
  <ion-app>
    <suspense v-if="auth.initialized && main.initialized">
      <template #default>
        <ion-router-outlet />
      </template>
      <template #fallback>
        <div>
          Loading...
        </div>
      </template>
    </suspense>
    <div v-else>
        Loading...
    </div>
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from "./store/auth";
import { useMainStore } from "./store/main";

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  },
  mounted() {
    // restore path state
    // if (this.router.path !== this.main.currentPath) {
    // window.location.href = this.main.currentPath;
    // }
  },
  setup() {
    const auth = useAuthStore();
    const main = useMainStore();
    const router = useRouter();
    return {
      auth,
      main,
      router,
    };
  },
});
</script>