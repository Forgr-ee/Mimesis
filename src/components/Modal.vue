<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ title }}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
    >
      <div class="relative w-auto max-w-3xl mx-auto my-6">
        <div
          class="relative flex flex-col border-2 rounded-lg shadow-lg outline-none border-primary text-primary bg-secondary focus:outline-none"
        >
          <div
            class="flex items-start justify-between p-5 border-b rounded-t border-primary"
          >
            <h3 class="text-4xl font-semibold animate-bounce">
              {{ head }}
            </h3>
          </div>
          <div class="relative flex-auto p-6">
            {{ body }}
          </div>
          <div
            class="flex items-center justify-end p-6 border-t rounded-b border-primary"
          >
            <button
              v-if="left"
              class="px-6 py-3 mb-1 mr-1 text-xs font-bold uppercase transition-all duration-150 ease-linear border rounded shadow outline-none bg-primary text-light border-light md:text-base hover:shadow-lg focus:outline-none"
              type="button"
              @click="leftClick()"
            >
              {{ leftText }}
            </button>
            <button
              v-if="right"
              class="px-6 py-3 mb-1 mr-1 text-xs font-bold uppercase transition-all duration-150 ease-linear border rounded shadow outline-none bg-light text-primary border-primary md:text-base hover:shadow-lg focus:outline-none"
              type="button"
              @click="rightClick()"
            >
              {{ rightText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </ion-content>
</template>

<script>
import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "Modal",
  props: {
    title: { type: String, default: "Super Modal" },
  },
  data() {
    return {
      content: "Content",
    };
  },
  components: { IonContent, IonHeader, IonTitle, IonToolbar },
});
</script>
