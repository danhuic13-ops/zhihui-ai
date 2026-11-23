<script setup>
import { useRoute } from 'vue-router'
import WorkspaceSidebar from './components/WorkspaceSidebar.vue'
const route = useRoute()
</script>

<template>
  <div :class="route.name === 'ai' ? 'chat-page' : 'app-shell'">
    <WorkspaceSidebar v-if="route.name !== 'ai'" class="app-sidebar" />
    <div class="app-body">
      <header v-if="route.name === 'todo'" class="app-header"><h1>学习计划</h1></header>
      <main :class="route.name === 'ai' ? 'chat-route-content' : 'app-main'">
        <RouterView v-slot="{ Component }">
          <KeepAlive include="AIChatView">
            <component :is="Component" />
          </KeepAlive>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style>
.chat-page > .app-body, .chat-route-content { height: 100%; min-height: 0; }
</style>
