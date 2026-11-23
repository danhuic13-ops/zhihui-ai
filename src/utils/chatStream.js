export async function* parseSSE(body, signal) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (!signal.aborted) {
      const { value, done } = await reader.read()
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true })
      const events = buffer.split(/\r?\n\r?\n/)
      buffer = events.pop() || ''
      if (done && buffer.trim()) events.push(buffer)
      for (const event of events) {
        const data = event.split(/\r?\n/)
          .filter(line => line.startsWith('data:'))
          .map(line => line.slice(5).replace(/^ /, ''))
          .join('\n')
        if (data) yield data
      }
      if (done) break
    }
  } finally {
    reader.releaseLock()
  }
}

export function getReplyContent(payload) {
  if (payload.error || (payload.code != null && Number(payload.code) !== 0)) {
    throw new Error(payload.error?.message || payload.error || payload.message || `AI 服务错误 ${payload.code}`)
  }
  return payload.choices?.[0]?.delta?.content || payload.choices?.[0]?.message?.content || ''
}
