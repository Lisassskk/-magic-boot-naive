import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTabsStore = defineStore('tabs', () => {

  const currentTab = ref('')
  const tabs = ref([])

  function setCurrentTab(value){
    currentTab.value = value
  }

  const getCurrentTab = computed(() => currentTab.value)

  function pushTab(value){
    tabs.value.push(value)
  }

  function closeTab(i){
    tabs.value.splice(i, 1)
  }

  function replaceTab(value, i){
    tabs.value[i] = value
  }

  const getTabs = computed(() => tabs.value)

  return {
    setCurrentTab,
    pushTab,
    closeTab,
    replaceTab,
    getCurrentTab,
    getTabs
  }
})