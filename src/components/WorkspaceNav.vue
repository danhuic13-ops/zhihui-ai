<script setup>
import { useRoute } from 'vue-router'
import { ChatDotRound, CircleCheck, InfoFilled } from '@element-plus/icons-vue'

const route = useRoute()
const links = [
  { name: 'ai', label: '对话', icon: ChatDotRound },
  { name: 'todo', label: '学习计划', icon: CircleCheck },
  { name: 'about', label: '关于', icon: InfoFilled }
]
</script>

<template>
  <RouterLink :to="{ name: 'ai' }" class="workspace-brand">知慧</RouterLink>
  <nav class="workspace-nav" aria-label="主导航">
    <RouterLink v-for="link in links" :key="link.name" :to="{ name: link.name }"
      :class="{ selected: route.name === link.name }">
      <el-icon><component :is="link.icon" /></el-icon>{{ link.label }}
    </RouterLink>
  </nav>
</template>
