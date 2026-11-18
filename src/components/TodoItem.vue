<script setup>
import { Delete } from '@element-plus/icons-vue'
defineProps({ todo: { type: Object, required: true }, isSelected: Boolean })
const emit = defineEmits(['delete', 'toggle', 'toggle-selection'])
</script>
<template>
  <div class="todo-item" :class="{ completed: todo.completed, selected: isSelected }">
    <el-checkbox :model-value="isSelected" @change="emit('toggle-selection', todo.id)" :aria-label="`选择计划：${todo.text}`"/>
    <el-checkbox :model-value="todo.completed" @change="emit('toggle', todo.id)" :aria-label="`完成计划：${todo.text}`" class="completion-checkbox"/>
    <span class="todo-text">{{ todo.text }}</span><span class="task-status">{{ todo.completed ? '已完成' : '进行中' }}</span>
    <el-button :icon="Delete" text type="danger" @click="emit('delete', todo.id)" :aria-label="`删除计划：${todo.text}`"/>
  </div>
</template>
<style scoped>
.todo-item{display:flex;align-items:center;gap:14px;min-height:76px;padding:12px 8px;border-bottom:1px solid #f0f3ef;transition:background .2s;border-radius:10px}.todo-item:last-child{border-bottom:none}.todo-item:hover{background:#f8fbf8}.todo-item.selected{background:#edf6ef}.todo-text{flex:1;min-width:0;overflow-wrap:anywhere;font-size:13px;line-height:1.8;color:#455a4e}.completed .todo-text{text-decoration:line-through;color:#a8b2ab}.task-status{padding:4px 8px;border-radius:5px;font-size:10px;background:#f5f1e8;color:#b39d72;white-space:nowrap}.completed .task-status{background:#edf5ed;color:#8ba18d}.completion-checkbox :deep(.el-checkbox__inner){border-radius:50%;width:18px;height:18px}.completion-checkbox :deep(.el-checkbox__inner::after){left:6px;top:3px}@media(max-width:680px){.todo-item{gap:9px}.task-status{display:none}.todo-text{font-size:12px}}
</style>
