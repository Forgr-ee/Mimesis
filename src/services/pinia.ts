import { createPinia, Pinia } from 'pinia'
import { watch } from 'vue'
import { getStorage, setStorage } from './storage'

export default (): Pinia => {
  const pinia = createPinia()
  pinia.use(async (context) => {
    // Set the whole store from Storage
    const newState = await getStorage(
      `state_${context.store.$id}`,
      context.store.$state
    )
    context.store.$patch(newState as never)
    // Save the whole store to storage to persist app state
    watch(
      context.store.$state,
      (state) => {
        setStorage(`state_${context.store.$id}`, state)
      },
      { deep: true }
    )
  })
  return pinia
}
