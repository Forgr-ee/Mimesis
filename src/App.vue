<template>
  <ion-app>
    <suspense v-if="isInit">
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
import { computed } from 'vue';
import { useAuthStore } from "./store/auth";
import { useMainStore } from "./store/main";

const auth = useAuthStore();
const main = useMainStore();
const isInit = computed(() => auth.initialized && main.initialized);
</script>