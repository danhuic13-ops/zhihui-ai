import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'xuesi-chat:sessions:v1'
const MAX_SESSIONS = 30
const MAX_MESSAGES_PER_SESSION = 1000
const MAX_STORAGE_CHARS = 4_000_000
const DEFAULT_MESSAGE = () => ({
  id: crypto.randomUUID(),
  role: 'assistant',
  content: '你好！我是你的AI助手，有什么可以帮助你的吗？',
  status: 'complete',
  createdAt: Date.now()
})

function makeSession() {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    title: '新对话',
    createdAt: now,
    updatedAt: now,
    messages: [DEFAULT_MESSAGE()]
  }
}

function isValidMessage(message) {
  return message && typeof message.id === 'string' &&
    ['user', 'assistant'].includes(message.role) && typeof message.content === 'string'
}

function hasUserMessages(session) {
  return session.messages.some(message => message.role === 'user' && message.content.trim())
}

function readSessions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(session => session && typeof session.id === 'string' &&
      Array.isArray(session.messages) && session.messages.every(isValidMessage))
      .filter(hasUserMessages)
      .slice(0, MAX_SESSIONS)
      .map(session => ({
        ...session,
        messages: session.messages.slice(-MAX_MESSAGES_PER_SESSION).map(message => ({
          ...message,
          status: message.status === 'error' ? 'error' : 'complete'
        }))
      }))
  } catch {
    return []
  }
}

export const useChatStore = defineStore('chat', () => {
  const sessions = ref(readSessions())
  if (!sessions.value.length) sessions.value = [makeSession()]
  const activeSessionId = ref(sessions.value[0].id)
  const activeSession = computed(() => sessions.value.find(session => session.id === activeSessionId.value))
  const historySessions = computed(() => sessions.value.filter(hasUserMessages))
  const messages = computed(() => activeSession.value?.messages || [])
  let persistTimer

  watch(sessions, () => {
    clearTimeout(persistTimer)
    persistTimer = setTimeout(() => {
      try {
        // 容量裁剪只作用于缓存副本，避免删除页面中正在显示的消息。
        const snapshot = JSON.parse(JSON.stringify(historySessions.value.slice(0, MAX_SESSIONS)))
        while (JSON.stringify(snapshot).length > MAX_STORAGE_CHARS && snapshot.length) {
          const largest = snapshot.reduce((best, item, index) =>
            item.messages.length > snapshot[best].messages.length ? index : best, 0)
          if (snapshot[largest].messages.length > 2) snapshot[largest].messages.splice(0, 2)
          else snapshot.pop()
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
      } catch (error) {
        console.warn('无法保存聊天记录', error)
      }
    }, 400)
  }, { deep: true })

  function createSession() {
    const emptySession = sessions.value.find(session => !hasUserMessages(session))
    if (emptySession) {
      activeSessionId.value = emptySession.id
      return emptySession
    }
    const session = makeSession()
    sessions.value.unshift(session)
    sessions.value = sessions.value.slice(0, MAX_SESSIONS + 1)
    activeSessionId.value = session.id
    return session
  }

  function selectSession(id) {
    if (sessions.value.some(session => session.id === id)) activeSessionId.value = id
  }

  function deleteSession(id) {
    sessions.value = sessions.value.filter(session => session.id !== id)
    if (!sessions.value.length) sessions.value = [makeSession()]
    if (activeSessionId.value === id) activeSessionId.value = sessions.value[0].id
  }

  function addMessage(sessionId, message) {
    const session = sessions.value.find(item => item.id === sessionId)
    if (!session) return
    session.messages.push(message)
    session.messages = session.messages.slice(-MAX_MESSAGES_PER_SESSION)
    session.updatedAt = Date.now()
    if (message.role === 'user' && session.title === '新对话') {
      session.title = message.content.trim().slice(0, 24) || '新对话'
    }
  }

  function updateMessage(sessionId, messageId, updates) {
    const message = sessions.value.find(item => item.id === sessionId)?.messages.find(item => item.id === messageId)
    if (message) Object.assign(message, updates)
  }

  function clearSession(sessionId) {
    const session = sessions.value.find(item => item.id === sessionId)
    if (session) {
      session.messages = [DEFAULT_MESSAGE()]
      session.title = '新对话'
      session.updatedAt = Date.now()
    }
  }

  return { sessions, historySessions, activeSessionId, activeSession, messages, createSession, selectSession, deleteSession, addMessage, updateMessage, clearSession }
})
