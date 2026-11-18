<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ChatDotRound, Delete, Microphone, Plus, VideoPause } from '@element-plus/icons-vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { useChatStore } from '../stores/chat'
import ChatMessage from '../components/ChatMessage.vue'

const store = useChatStore()
const inputMessage = ref('')
const scroller = ref(null)
const speechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
const isListening = ref(false)
const activeRequest = ref(null)
const isGenerating = computed(() => Boolean(activeRequest.value))
const waitingForFirstToken = computed(() => {
  const request = activeRequest.value
  if (!request?.messageId) return Boolean(request)
  const message = store.activeSession?.messages.find(item => item.id === request.messageId)
  return !message?.content
})
const renderedMessages = computed(() => waitingForFirstToken.value
  ? [...store.messages.filter(message => message.id !== activeRequest.value?.messageId), { id: '__typing-indicator__', typing: true }]
  : store.messages)
let recognition

function scrollToBottom() {
  nextTick(() => scroller.value?.scrollToBottom())
}

watch(() => store.activeSessionId, scrollToBottom)

function cancelRequest() {
  const request = activeRequest.value
  if (!request) return
  request.flush?.()
  request.controller.abort()
  activeRequest.value = null
  if (request.messageId) store.updateMessage(request.sessionId, request.messageId, { status: 'cancelled' })
}

function createSession() {
  cancelRequest()
  store.createSession()
  scrollToBottom()
}

function selectSession(id) {
  if (id === store.activeSessionId) return
  cancelRequest()
  store.selectSession(id)
}

async function deleteSession(session) {
  try {
    await ElMessageBox.confirm(`删除“${session.title}”及其聊天记录？`, '删除会话', { type: 'warning' })
    if (session.id === store.activeSessionId) cancelRequest()
    store.deleteSession(session.id)
  } catch {
    // 用户取消
  }
}

async function* parseSSE(body, signal) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      if (signal.aborted) return
      const { value, done } = await reader.read()
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true })
      const events = buffer.split(/\r?\n\r?\n/)
      buffer = done ? '' : events.pop()
      for (const event of events) {
        const data = event.split(/\r?\n/)
          .filter(line => line.startsWith('data:'))
          .map(line => line.slice(5).replace(/^ /, ''))
          .join('\n')
        if (data) yield data
      }
      if (done) break
    }
    if (buffer.trim()) {
      const data = buffer.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trim()).join('\n')
      if (data) yield data
    }
  } finally {
    reader.releaseLock()
  }
}

async function sendMessage() {
  const content = inputMessage.value.trim()
  if (!content || isGenerating.value) return

  const session = store.activeSession
  if (!session) return
  const sessionId = session.id
  const userMessage = { id: crypto.randomUUID(), role: 'user', content, status: 'complete', createdAt: Date.now() }
  store.addMessage(sessionId, userMessage)
  inputMessage.value = ''
  const request = { id: crypto.randomUUID(), sessionId, controller: new AbortController(), messageId: null }
  activeRequest.value = request
  scrollToBottom()

  try {
    const apiMessages = session.messages
      .filter(message => ['user', 'assistant'].includes(message.role) && message.status !== 'error' && message.content)
      .map(({ role, content: messageContent }) => ({ role, content: messageContent }))
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
      body: JSON.stringify({ messages: apiMessages }),
      signal: request.controller.signal
    })
    if (!response.ok) throw new Error(`請求失敗 (${response.status})`)
    if (!response.body) throw new Error('浏览器不支持流式响应')

    const answer = { id: crypto.randomUUID(), role: 'assistant', content: '', status: 'streaming', createdAt: Date.now() }
    request.messageId = answer.id
    store.addMessage(sessionId, answer)
    let replyContent = ''
    let pendingContent = ''
    let renderFrame = 0
    const flushContent = () => {
      if (renderFrame) cancelAnimationFrame(renderFrame)
      renderFrame = 0
      if (!pendingContent) return
      // 只通过响应式仓库写入；直接修改原始 answer 会绕过 Vue 的更新通知。
      replyContent += pendingContent
      pendingContent = ''
      store.updateMessage(sessionId, answer.id, { content: replyContent })
    }
    request.flush = flushContent
    for await (const data of parseSSE(response.body, request.controller.signal)) {
      if (data === '[DONE]') break
      let payload
      try { payload = JSON.parse(data) } catch { continue }
      if (payload.error || (payload.code != null && Number(payload.code) !== 0)) {
        throw new Error(payload.error?.message || payload.error || payload.message || `AI 服务错误 ${payload.code}`)
      }
      const delta = payload.choices?.[0]?.delta?.content || payload.choices?.[0]?.message?.content || ''
      if (delta && activeRequest.value?.id === request.id) {
        pendingContent += delta
        if (!renderFrame) renderFrame = requestAnimationFrame(flushContent)
      }
    }
    flushContent()
    if (activeRequest.value?.id === request.id) {
      store.updateMessage(sessionId, answer.id, { status: answer.content ? 'complete' : 'error', content: answer.content || '接口没有返回内容' })
    }
  } catch (error) {
    request.flush?.()
    if (error.name !== 'AbortError' && activeRequest.value?.id === request.id) {
      console.error('AI 请求失败', error)
      if (request.messageId) store.updateMessage(sessionId, request.messageId, { status: 'error', content: error.message || '获取AI回复失败' })
      else store.addMessage(sessionId, { id: crypto.randomUUID(), role: 'assistant', content: error.message || '获取AI回复失败', status: 'error', createdAt: Date.now() })
      ElMessage.error(error.message || '获取AI回复失败，请稍后重试')
    }
  } finally {
    request.flush = null
    if (activeRequest.value?.id === request.id) activeRequest.value = null
    if (store.activeSessionId === sessionId) scrollToBottom()
  }
}

function toggleSpeech() {
  if (!speechSupported) {
    ElMessage.warning('当前浏览器不支持语音输入')
    return
  }
  if (isListening.value) {
    recognition?.stop()
    return
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognition()
  recognition.lang = 'zh-CN'
  recognition.interimResults = true
  recognition.continuous = false
  recognition.onresult = event => {
    inputMessage.value = Array.from(event.results).map(result => result[0].transcript).join('')
  }
  recognition.onerror = () => { isListening.value = false; ElMessage.warning('语音识别失败，请检查麦克风权限') }
  recognition.onend = () => { isListening.value = false }
  recognition.start()
  isListening.value = true
}

onBeforeUnmount(() => {
  cancelRequest()
  recognition?.stop()
})
</script>

<template>
  <section class="chat-workspace">
    <aside class="session-panel">
      <div class="session-heading">
        <strong>对话</strong>
        <el-button aria-label="新建对话" title="新建对话" :icon="Plus" circle @click="createSession" />
      </div>
      <div class="session-list">
        <div v-for="session in store.historySessions" :key="session.id" class="session-row" :class="{ active: session.id === store.activeSessionId }">
          <button class="session-select" @click="selectSession(session.id)">
            <span>{{ session.title }}</span>
            <small>{{ session.messages.filter(message => message.role === 'user').length }} 条提问</small>
          </button>
          <el-button class="session-delete" aria-label="删除对话" title="删除对话" :icon="Delete" text @click="deleteSession(session)" />
        </div>
      </div>
    </aside>

    <div class="chat-container">
      <DynamicScroller
        ref="scroller"
        class="chat-messages"
        :items="renderedMessages"
        :min-item-size="72"
        key-field="id"
        :buffer="600"
      >
        <template #default="{ item, index, active }">
          <DynamicScrollerItem :item="item" :active="active" :index="index" class="message-row">
            <div v-if="item.typing" class="typing-row" role="status" aria-label="AI 正在思考">
              <div class="typing-bubble">
                <span v-for="dot in 3" :key="dot" class="typing-dot" />
              </div>
            </div>
            <ChatMessage v-else :message="item" />
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>

      <div class="input-area">
        <el-input v-model="inputMessage" placeholder="向学思智答提问..." @keyup.enter.exact="sendMessage" type="textarea" :rows="3" resize="none" />
        <div class="composer-actions">
          <span class="composer-hint">支持 Markdown、公式與代码</span>
          <div class="composer-buttons">
            <el-button v-if="speechSupported" :type="isListening ? 'danger' : 'default'" :icon="Microphone" :aria-label="isListening ? '停止语音输入' : '语音输入'" :title="isListening ? '停止语音输入' : '语音输入'" @click="toggleSpeech">{{ isListening ? '聆听中' : '语音' }}</el-button>
            <el-button v-if="isGenerating" type="warning" :icon="VideoPause" @click="cancelRequest">停止生成</el-button>
            <el-button v-else type="primary" :icon="ChatDotRound" :disabled="!inputMessage.trim()" @click="sendMessage">发送</el-button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.chat-workspace { display: flex; height: 100%; min-height: 0; background: #fff; border: 1px solid #e4e8ec; border-radius: 6px; overflow: hidden; }
.session-panel { width: 250px; flex: 0 0 250px; display: flex; flex-direction: column; border-right: 1px solid #e4e8ec; background: #f7f9fa; }
.session-heading { height: 56px; flex: 0 0 56px; padding: 0 14px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e4e8ec; }
.session-list { overflow: auto; padding: 8px; }
.session-row { display: flex; align-items: center; margin-bottom: 4px; border-radius: 5px; }
.session-row.active { background: #e7f3f4; }
.session-select { flex: 1; min-width: 0; padding: 9px 8px; border: 0; color: #263238; background: transparent; text-align: left; cursor: pointer; }
.session-select span, .session-select small { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.session-select span { font-size: 13px; }
.session-select small { margin-top: 4px; color: #78858d; font-size: 11px; }
.session-delete { opacity: 0; }
.session-row:hover .session-delete, .session-row.active .session-delete { opacity: 1; }
.chat-container { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.chat-messages { flex: 1; min-height: 0; padding: 16px 20px; background: #fafbfc; }
.message-row { padding-bottom: 12px; }
.typing-row { display: flex; align-items: flex-start; }
.typing-bubble { height: 42px; min-width: 66px; padding: 0 18px; display: flex; align-items: center; justify-content: center; gap: 7px; }
.typing-dot { width: 9px; height: 9px; border-radius: 50%; background: #73777b; animation: typing-pulse 1.15s ease-in-out infinite; }
.typing-dot:nth-child(2) { animation-delay: 0.16s; }
.typing-dot:nth-child(3) { animation-delay: 0.32s; }
@keyframes typing-pulse { 0%, 60%, 100% { opacity: .35; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
@media (prefers-reduced-motion: reduce) { .typing-dot { animation: none; } }
.message-item { display: flex; align-items: flex-start; }
.ai-message { justify-content: flex-start; }
.user-message { justify-content: flex-end; }
.message-content { max-width: min(82%, 820px); padding: 12px 15px; border-radius: 8px; font-size: 14px; line-height: 1.65; overflow-wrap: anywhere; }
.ai-message .message-content { background: #fff; border: 1px solid #e3e8ec; }
.user-message .message-content { background: #e5f3f2; color: #173b3b; }
.input-area { padding: 14px 18px; background: #fff; border-top: 1px solid #e4e8ec; }
.input-area :deep(.el-textarea__inner) { border-radius: 6px; resize: none; font-size: 14px; }
.composer-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 8px; }
.composer-hint { color: #7b8790; font-size: 12px; }
.composer-buttons { display: flex; gap: 8px; }
.katex { font-size: 1.05em; }
@media (max-width: 680px) {
  .session-panel { width: 150px; flex-basis: 150px; }
  .chat-messages { padding: 12px 10px; }
  .message-content { max-width: 94%; }
  .input-area { padding: 10px; }
  .composer-hint { display: none; }
}
</style>
