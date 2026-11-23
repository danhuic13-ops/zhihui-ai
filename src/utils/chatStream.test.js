import test from 'node:test'
import assert from 'node:assert/strict'
import { parseSSE, getReplyContent } from './chatStream.js'

async function readEvents(text, fragmented = false) {
  const bytes = new TextEncoder().encode(text)
  const stream = new ReadableStream({
    start(controller) {
      if (fragmented) {
        for (const byte of bytes) controller.enqueue(Uint8Array.of(byte))
      } else controller.enqueue(bytes)
      controller.close()
    },
  })
  const events = []
  for await (const data of parseSSE(stream, new AbortController().signal)) events.push(data)
  return events
}

test('keeps the final event when the server closes without a blank line', async () => {
  const data = JSON.stringify({ choices: [{ delta: { content: '数学公式' } }] })
  assert.deepEqual(await readEvents('data: ' + data), [data])
})

test('handles UTF-8 split across chunks, CRLF, comments and DONE', async () => {
  const data = JSON.stringify({ choices: [{ delta: { content: '你好' } }] })
  assert.deepEqual(await readEvents(': ping\r\n\r\ndata: ' + data + '\r\n\r\ndata: [DONE]\r\n\r\n', true), [data, '[DONE]'])
})

test('extracts streamed and JSON replies and exposes provider errors', () => {
  assert.equal(getReplyContent({ choices: [{ delta: { content: '公式' } }] }), '公式')
  assert.equal(getReplyContent({ choices: [{ message: { content: '回答' } }] }), '回答')
  assert.throws(() => getReplyContent({ error: { message: '额度不足' } }), /额度不足/)
  assert.throws(() => getReplyContent({ code: 1001, message: '鉴权失败' }), /鉴权失败/)
})
