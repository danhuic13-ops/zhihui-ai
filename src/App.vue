<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { House, ChatDotRound, CircleCheck, InfoFilled, Reading, ArrowRight } from '@element-plus/icons-vue'
const route = useRoute()
const links = [
  { path: '/', label: '学习概览', icon: House, caption: '从这里开始今天的学习' },
  { path: '/ai', label: '智能答疑', icon: ChatDotRound, caption: '让每个问题都有新的思路' },
  { path: '/todo', label: '学习计划', icon: CircleCheck, caption: '把目标拆成每一个小进步' },
  { path: '/about', label: '关于平台', icon: InfoFilled, caption: '认识你的学习伙伴' }
]
const current = computed(() => links.find(item => item.path === route.path) || links[0])
</script>
<template>
  <div class="app-shell">
    <aside class="app-sidebar">
      <router-link to="/" class="brand"><span class="brand-icon"><el-icon><Reading /></el-icon></span><span>学思智答<small>你的专属学习空间</small></span></router-link>
      <div class="nav-label">学习工作台</div>
      <nav class="app-nav" aria-label="主导航">
        <router-link v-for="item in links" :key="item.path" :to="item.path" :class="{ selected: route.path === item.path }"><el-icon><component :is="item.icon" /></el-icon><span>{{ item.label }}</span><el-icon class="nav-arrow"><ArrowRight /></el-icon></router-link>
      </nav>
      <div class="sidebar-note"><span>一点好奇，无限可能</span><p>每一个问题，都是进步的开始。</p><router-link to="/ai">开启新的探索 ↗</router-link></div>
      <div class="sidebar-footer"><span class="avatar">学</span><div>保持好奇<small>让学习成为日常</small></div></div>
    </aside>
    <div class="app-body">
      <header class="app-header"><div><span class="header-label">我的学习空间 / {{ current.label }}</span><h1>{{ current.label }}</h1></div><span class="header-caption">{{ current.caption }}</span></header>
      <main class="app-main" :class="{ 'chat-page': route.path === '/ai' }"><router-view /></main>
    </div>
  </div>
</template>
