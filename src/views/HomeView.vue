<script setup>
import { computed } from 'vue'
import { useTodoStore } from '../stores/todo'
import { useChatStore } from '../stores/chat'
import { ChatDotRound, ArrowRight, Calendar, CircleCheck, Reading } from '@element-plus/icons-vue'
const todo = useTodoStore()
const chat = useChatStore()
const questionCount = computed(() => chat.historySessions.reduce((total, session) => total + session.messages.filter(message => message.role === 'user').length, 0))
const prompts = ['帮我制定一份循序渐进的学习计划', '用简单的例子解释 JavaScript 的闭包', '如何更高效地复习和整理错题？']
</script>
<template>
  <div class="page-width home-page">
    <section class="welcome-banner"><div class="welcome-copy"><span class="eyebrow">每一天，都有新收获</span><h2>让好奇心，<br>带你走得更远。</h2><p>解答一个疑问，完成一个小目标。<br>和学思智答一起，找到属于你的学习节奏。</p><router-link to="/ai" class="primary-link">开始提问 <el-icon><ArrowRight /></el-icon></router-link></div><div class="welcome-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="book-symbol"><el-icon><Reading /></el-icon></div><span class="art-tag tag-one">探索 · 理解</span><span class="art-tag tag-two">每天进步一点点 ✦</span></div></section>
    <div class="overview-stats"><div class="stat-card"><span class="stat-icon mint"><el-icon><ChatDotRound /></el-icon></span><div><small>累计提问</small><strong>{{ questionCount }} <em>次</em></strong></div></div><div class="stat-card"><span class="stat-icon peach"><el-icon><Calendar /></el-icon></span><div><small>待完成计划</small><strong>{{ todo.remainingCount }} <em>项</em></strong></div></div><div class="stat-card"><span class="stat-icon lavender"><el-icon><CircleCheck /></el-icon></span><div><small>已完成计划</small><strong>{{ todo.todos.length - todo.remainingCount }} <em>项</em></strong></div></div></div>
    <div class="home-columns"><section class="surface"><div class="section-heading"><h3>从一个问题开始</h3><span>灵感小站</span></div><p class="muted">不知道问什么？试着从这些话题探索。</p><router-link v-for="(prompt, index) in prompts" :key="prompt" to="/ai" class="prompt-link"><span class="prompt-number">0{{ index + 1 }}</span>{{ prompt }}<el-icon><ArrowRight /></el-icon></router-link></section><section class="surface"><div class="section-heading"><h3>接下来的小目标</h3><router-link to="/todo">查看全部 ↗</router-link></div><div v-if="!todo.todos.filter(item => !item.completed).length" class="gentle-empty">暂时没有待办，给今天安排一个小目标吧。</div><div v-for="item in todo.todos.filter(item => !item.completed).slice(0, 3)" :key="item.id" class="mini-task"><span class="task-ring"></span>{{ item.text }}</div><router-link to="/todo" class="subtle-link">＋ 添加学习计划</router-link></section></div>
  </div>
</template>
