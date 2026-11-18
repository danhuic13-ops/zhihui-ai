<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import markdownKatex from 'markdown-it-katex'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'

for (const [name, language] of Object.entries({ bash, css, javascript, json, python, typescript, xml })) {
  hljs.registerLanguage(name, language)
}

const props = defineProps({ message: { type: Object, required: true } })
const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  highlight(code, language) {
    if (language && hljs.getLanguage(language)) {
      return `<pre class="hljs"><code>${hljs.highlight(code, { language }).value}</code></pre>`
    }
    return `<pre class="hljs"><code>${hljs.highlightAuto(code).value}</code></pre>`
  }
}).use(markdownKatex)
const rendered = computed(() => markdown.render(props.message.content || ''))
</script>

<template>
  <article class="message-item" :class="message.role === 'assistant' ? 'ai-message' : 'user-message'">
    <div class="message-content" :class="{ 'message-error': message.status === 'error' }">
      <div v-html="rendered" />
      <span v-if="message.status === 'streaming'" class="stream-cursor" aria-hidden="true" />
    </div>
  </article>
</template>

<style>
.message-content :first-child { margin-top: 0; }
.message-content :last-child { margin-bottom: 0; }
.message-content p, .message-content ul, .message-content ol, .message-content blockquote { margin: 0 0 10px; }
.message-content pre { overflow-x: auto; padding: 12px; border-radius: 6px; background: #17212b; color: #e8edf2; }
.message-content code:not(pre code) { padding: 2px 4px; border-radius: 3px; background: #eef2f5; }
.message-content table { border-collapse: collapse; }
.message-content th, .message-content td { border: 1px solid #d9e0e6; padding: 5px 8px; }
.message-content .katex-display { overflow-x: auto; overflow-y: hidden; }
.message-error { color: #b42318; }
.stream-cursor { display: inline-block; width: 2px; height: 1em; margin-left: 2px; vertical-align: -2px; background: #516a70; animation: cursor-blink 1s steps(2, start) infinite; }
@keyframes cursor-blink { to { visibility: hidden; } }
</style>
