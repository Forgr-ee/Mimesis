import { createPinia } from 'pinia';
import { watch } from 'vue';
import { getStorage, setStorage } from './storage';

const pinia = createPinia();
pinia.use(async (context) => {
    // Set the whole store from Storage
    const newState = await getStorage(`state_${context.store.$id}`, context.store.$state);
    context.store.$patch(newState);
    // Save the whole store to storage to persist app state
    watch(context.store.$state, (state) => {
        setStorage(`state_${context.store.$id}`, state)  
    }, { deep: true })
})

export default pinia;