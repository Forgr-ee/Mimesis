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

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useAuthStore } from "./store/auth";
import { useMainStore } from "./store/main";

const auth = useAuthStore();
const main = useMainStore();
</script>