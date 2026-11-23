<script setup>
import { onBeforeUnmount, onDeactivated, ref } from 'vue'
import { useLayoutStore } from '../stores/layout'
import WorkspaceNav from './WorkspaceNav.vue'

const layout = useLayoutStore()
const handle = ref(null)
const resizing = ref(false)
let drag = null

function start(event) {
  if (event.button !== 0 || drag) return
  event.currentTarget.setPointerCapture(event.pointerId)
  drag = { id: event.pointerId, x: event.clientX, width: layout.sidebarWidth }
  resizing.value = true
}

function move(event) {
  if (drag?.id === event.pointerId) layout.setSidebarWidth(drag.width + event.clientX - drag.x)
}

function stop() {
  const id = drag?.id
  drag = null
  resizing.value = false
  if (id != null && handle.value?.hasPointerCapture(id)) handle.value.releasePointerCapture(id)
}

function resizeWithKey(event) {
  const widths = { ArrowLeft: layout.sidebarWidth - 16, ArrowRight: layout.sidebarWidth + 16, Home: 180, End: 400 }
  if (!(event.key in widths)) return
  event.preventDefault()
  layout.setSidebarWidth(widths[event.key])
}

onDeactivated(stop)
onBeforeUnmount(stop)
</script>

<template>
  <aside class="workspace-sidebar" :class="{ 'is-resizing': resizing }" :style="{ '--workspace-sidebar-width': layout.sidebarWidth + 'px' }">
    <WorkspaceNav />
    <slot />
    <div ref="handle" class="workspace-sidebar-handle" role="separator" tabindex="0"
      aria-label="调整导航栏宽度" aria-orientation="vertical"
      :aria-valuemin="180" :aria-valuemax="400" :aria-valuenow="layout.sidebarWidth"
      @pointerdown="start" @pointermove="move" @pointerup="stop"
      @pointercancel="stop" @lostpointercapture="stop" @keydown="resizeWithKey" />
  </aside>
</template>

<style>
.workspace-sidebar-handle { position:absolute; z-index:2; inset:0 -5px 0 auto; width:10px; cursor:col-resize; touch-action:none; }
.workspace-sidebar-handle::after { content:''; position:absolute; inset:0 4px; background:transparent; }
.workspace-sidebar-handle:hover::after, .workspace-sidebar-handle:focus-visible::after,
.is-resizing > .workspace-sidebar-handle::after { background:#888; }
.workspace-sidebar.is-resizing { user-select:none; cursor:col-resize; }
@media (min-width:681px) {
  .app-sidebar.workspace-sidebar, .chat-page .session-panel.workspace-sidebar {
    position:relative; width:var(--workspace-sidebar-width); flex:0 0 var(--workspace-sidebar-width);
    padding:16px 12px; background:#f7f7f7; border-right:1px solid #eee;
  }
}
@media (max-width:680px) { .workspace-sidebar-handle { display:none; } }
</style>
