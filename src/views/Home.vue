<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div
        class="flex flex-col justify-center h-screen bg-secondary item-center"
      >
        <img
          class="object-contain h-20 xsheight:h-32"
          src="assets/icon/icon.png"
          alt="logo"
        />
        <Modal :open="modals.lang" >
          <template v-slot:icon><TranslateIcon class="w-6 h-6 text-red-600" aria-hidden="true" /></template>
          <template v-slot:title>{{ $t("langTitle") }}</template>
          <template v-slot:content>
              <div>
              <button
                v-for="l in $i18n.availableLocales"
                class="p-2 my-2 font-medium rounded-lg"
                :class="{ 'bg-primary': $i18n.locale === l }"
                :key="`locale-${l}`"
                @click="$i18n.locale = l; main.lang = l"
              >
                {{ $t(l) }}
              </button>
              </div>
          </template>
          <template v-slot:buttons>
              <button type="button" @click="modals.lang = false" 
              class="px-6 py-3 mb-1 mr-1 text-xs font-bold uppercase transition-all duration-150 ease-linear border rounded shadow outline-none bg-primary text-light border-light md:text-base hover:shadow-lg focus:outline-none">
                {{ $t("accept") }}
              </button>
          </template>
        </Modal>
        <Modal :open="modals.rules" >
          <template v-slot:icon><ClipboardListIcon class="w-6 h-6 text-red-600" aria-hidden="true" /></template>
          <template v-slot:title>{{ $t("ruleTitle") }}</template>
          <template v-slot:content>
            <div class="text-left">
                <p className="my-1">
                  - {{ $t("rule010") }} <strong>{{ $t("rule011") }}</strong>
                  {{ $t("rule012") }}
                </p>
                <p className="my-1">
                  - {{ $t("rule020") }} <strong>{{ $t("rule021") }}</strong
                  >.
                </p>
                <p className="my-1">- {{ $t("rule030") }}</p>
                <p className="my-1">- {{ $t("rule040") }}</p>
                <p className="my-1 pt-5">
                  <strong>{{ $t("rule050") }}:</strong> {{ $t("rule051") }}
                </p>
              </div>
          </template>
          <template v-slot:buttons>
              <button type="button" @click="modals.rules = false" 
              class="px-6 py-3 mb-1 mr-1 text-xs font-bold uppercase transition-all duration-150 ease-linear border rounded shadow outline-none bg-primary text-light border-light md:text-base hover:shadow-lg focus:outline-none">
                {{ $t("accept") }}
              </button>
          </template>
        </Modal>
        <Modal :open="modals.inequal" >
          <template v-slot:icon><ExclamationIcon class="w-6 h-6 text-red-600" aria-hidden="true" /></template>
          <template v-slot:title>{{ $t("beCarefull") }}</template>
          <template v-slot:content>{{ $t("inequal") }}<br/> <strong>{{ $t("fairRule") }}</strong></template>
          <template v-slot:buttons>
              <button @click="modals.inequal=false" class="px-6 py-3 mb-1 mr-1 text-xs font-bold uppercase transition-all duration-150 ease-linear border rounded shadow outline-none bg-light text-primary border-primary md:text-base hover:shadow-lg focus:outline-none">{{ $t("update") }} {{ $t("team") }}</button>
              <router-link to="/theme" type="button" @click="modals.inequal=false" 
              class="px-6 py-3 mb-1 mr-1 text-xs font-bold uppercase transition-all duration-150 ease-linear border rounded shadow outline-none bg-primary text-light border-light md:text-base hover:shadow-lg focus:outline-none">
                {{ $t("go") }}
              </router-link>
          </template>
        </Modal>
        <div class="flex overflow-x-scroll no_bar">
          <div
            v-for="(team, index) in game.teams"
            :key="team.uuid"
            class="flex-none w-10/12 md:w-1/2"
            :class="{
              ' ml-8 md:ml-0': index === 0,
              'pr-3 md:m-0 ': index + 1 === game.teams.length,
            }"
          >
            <div
              class="relative flex flex-col items-center pt-10 pb-4 mx-3 my-5 border xs:my-10 md:mx-10 border-primary bg-light rounded-xl"
            >
              <p class="absolute top-0 left-0 p-2 text-primary">
                {{ $t("team") }} {{ index + 1 }}
              </p>
              <ion-input
                class="w-2/3 mx-auto mb-6 text-5xl text-center border-b-2 bg-light border-primary text-primary"
                :value="team.name"
              ></ion-input>
              <div class="mb-5 overflow-y-scroll no_bar h-28 xs:h-48">
                <div>
                <div
                  v-for="(player, index) in team.players"
                  class="flex items-center"
                  :key="player.uuid"
                >
                  <ion-input
                    class="my-1 text-lg text-center border rounded-lg text-primary bg-light border-primary"
                    :value="player.name"
                  ></ion-input>
                  <button
                    v-if="team.players.length > 2"
                    class="text-primary"
                    type="button"
                    @click="team.players.splice(index, 1)"
                  >
                    <vue-feather type="trash"></vue-feather>
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <button
                  className="text-primary"
                  type="button"
                  @click="team.players.push(randomPlayer(team.players.length))"
                >
                  <vue-feather type="plus-circle"></vue-feather>
                </button>
              </div>
              </div>
            <button
              v-if="game.teams.length > 2"
              class="text-primary"
              type="button"
              @click="game.teams.splice(index, 1)"
            >
              <vue-feather type="trash"></vue-feather>
            </button>
            </div>
          </div>
          <div className="fixed w-full px-5 text-right">
            <button
              @click="game.teams.push(randomTeam(game.teams.length))"
              class="w-12 h-12 rounded-full xs:mt-5 bg-primary text-light active:bg-secondary"
            >
              <vue-feather type="plus"></vue-feather>
            </button>
          </div>
        </div>
        <div class="flex justify-center text-5xl text-primary">
          <button
            @click="saveTeam()"
            class="w-1/2 px-5 py-2 overflow-hidden border-2 xs:mt-2 md:w-1/3 bg-light border-primary rounded-xl"
          >
            <div class="relative flex items-center justify-center">
              <vue-feather type="play"></vue-feather>
              <p>{{ $t("play") }}</p>
            </div>
          </button>
        </div>
        <div class="flex flex-colunm">
          <button @click="modals.lang = true"
            v-if="$i18n.availableLocales.length > 1"
            class="mx-auto mt-6"
          >
            <vue-feather
              type="flag"
              class="text-primary"
            ></vue-feather>
          </button>
          <button @click="modals.rules = true" class="mx-auto mt-6">
            <vue-feather type="help-circle" class="text-primary"></vue-feather>
          </button>
          <button class="mx-auto mt-6" @click="openChat()">
            <vue-feather
              type="message-circle"
              class="text-primary"
            ></vue-feather>
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { randomPlayer, randomTeam } from '@/store/game';
import { IonContent, IonPage, IonInput } from "@ionic/vue";
import { defineComponent, reactive } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../store/game";
import { useMainStore } from "../store/main";
import Modal from "./Modal.vue";
import { TranslateIcon, ClipboardListIcon, ExclamationIcon } from '@heroicons/vue/outline'

export default defineComponent({
  name: "Home",
  components: {
    Modal,
    ClipboardListIcon,
    ExclamationIcon,
    TranslateIcon,
    IonContent,
    IonInput,
    IonPage,
  },
  setup() {
    const modals = reactive({
      inequal: false,
      lang: false,
      rules: false,
    });
    const router = useRouter();
    const game = useGameStore();
    const main = useMainStore();
    const openChat = () => {
      window.$crisp.push(["do", "chat:show"]);
      window.$crisp.push(["do", "chat:open"]);
    };
    const saveTeam = () => {
      game.calcMode();
      if (game.mode === 1) {
        modals.inequal = true;
      } else {
        router.push("/theme");        
      }
    };
    return { router, game, main, modals, randomPlayer, randomTeam, openChat, saveTeam };
  },
});
</script>
