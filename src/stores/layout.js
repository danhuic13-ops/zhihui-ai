import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', () => {
  const sidebarWidth = ref(240)
  function setSidebarWidth(width) {
    sidebarWidth.value = Math.min(400, Math.max(180, Math.round(width)))
  }
  return { sidebarWidth, setSidebarWidth }
})
