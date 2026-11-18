<script setup>
import { computed, ref } from 'vue'
import { Plus, CircleCheck } from '@element-plus/icons-vue'
import TodoItem from '../components/TodoItem.vue'
import { useTodoStore } from '../stores/todo'
const todoStore = useTodoStore()
const newTodoText = ref('')
const completedCount = computed(() => todoStore.todos.filter(item => item.completed).length)
const progress = computed(() => todoStore.todos.length ? Math.round(completedCount.value / todoStore.todos.length * 100) : 0)
function addTodo() {
  if (!newTodoText.value.trim()) return
  todoStore.addTodo(newTodoText.value)
  newTodoText.value = ''
}
</script>
<template>
  <div class="page-width todo-page">
    <section class="plan-banner"><div><span class="eyebrow">小小行动，慢慢积累</span><h2>把今天，安排得刚刚好。</h2><p>不用一步到位，每完成一件事，都是在向目标靠近。</p></div><div class="progress-summary"><el-progress type="circle" :percentage="progress" :width="88" :stroke-width="6" color="#248878" track-color="#dceade"/><span>计划完成度</span></div></section>
    <div class="plan-summary"><span>全部计划 <strong>{{ todoStore.todos.length }}</strong></span><span>进行中 <strong>{{ todoStore.remainingCount }}</strong></span><span>已完成 <strong>{{ completedCount }}</strong></span></div>
    <section class="surface plan-surface"><div class="section-heading"><h3>我的学习清单</h3><span>一步一步，学有所获</span></div><div class="add-todo"><el-input v-model="newTodoText" placeholder="写下一个想完成的小目标…" @keyup.enter="addTodo" clearable aria-label="新学习计划"/><el-button type="primary" :icon="Plus" @click="addTodo" :disabled="!newTodoText.trim()">添加计划</el-button></div>
      <div v-if="todoStore.todos.length" class="task-toolbar"><el-checkbox :model-value="todoStore.isAllSelected" @change="todoStore.toggleAllSelection">选择全部</el-checkbox><el-button type="danger" text :disabled="!todoStore.hasSelectedTodos" @click="todoStore.batchDeleteTodos">删除选中（{{ todoStore.selectedTodoIds.size }}）</el-button></div>
      <div v-if="todoStore.todos.length" class="todo-items-container"><TodoItem v-for="todo in todoStore.todos" :key="todo.id" :todo="todo" :is-selected="todoStore.selectedTodoIds.has(todo.id)" @delete="todoStore.deleteTodo" @toggle="todoStore.toggleTodo" @toggle-selection="todoStore.toggleTodoSelection"/></div>
      <el-empty v-else description="清单还是空的，添加你的第一个学习目标吧" :image-size="100"/>
      <div v-if="todoStore.todos.length" class="plan-footer"><span><el-icon><CircleCheck /></el-icon> 已完成 {{ completedCount }} 项，继续保持自己的节奏</span><el-checkbox :model-value="todoStore.isAllCompleted" @change="todoStore.toggleAllTodos">全部完成</el-checkbox></div>
    </section>
  </div>
</template>
<style scoped>
.plan-banner{display:flex;justify-content:space-between;align-items:center;background:#eaf2e9;border:1px solid #e0eadb;border-radius:20px;padding:30px 34px;gap:20px}.plan-banner h2{font-size:25px;font-weight:500;letter-spacing:1px;margin:14px 0}.plan-banner p{color:#8a9d8a;font-size:12px;line-height:1.8}.progress-summary{display:flex;flex-direction:column;align-items:center;gap:10px}.progress-summary>span{font-size:10px;color:#8b9f8c}.plan-summary{display:flex;gap:36px;padding:26px 5px;font-size:12px;color:#87988f}.plan-summary strong{margin-left:8px;color:#334e41;font-size:18px;font-weight:500}.add-todo{display:flex;gap:12px;margin:24px 0 16px}.add-todo :deep(.el-input__wrapper){min-height:44px;background:#f9fbf9;box-shadow:0 0 0 1px #e6ede6 inset}.add-todo .el-button{height:44px}.task-toolbar{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #edf1ec;padding:4px 0 12px}.plan-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;border-top:1px solid #edf1ec;padding-top:18px;margin-top:8px}.plan-footer>span{display:flex;gap:8px;align-items:center;font-size:11px;color:#98a59c}.plan-footer .el-icon{color:#74a38a}@media(max-width:680px){.plan-banner{padding:24px 20px}.plan-banner h2{font-size:20px}.progress-summary{display:none}.plan-summary{gap:20px}.plan-footer{flex-wrap:wrap}.add-todo{gap:8px}.add-todo .el-button{padding:10px}}
</style>
