<script setup>
import { ChatDotRound, Collection, CircleCheck, Microphone, Reading } from '@element-plus/icons-vue'
const features = [
  { icon: ChatDotRound, title: '把疑问聊明白', description: '支持连续追问，回复逐步呈现，让复杂的问题变得容易理解。' },
  { icon: Collection, title: '让思路清晰可见', description: '清楚呈现公式、代码和结构化内容，帮助你整理知识脉络。' },
  { icon: CircleCheck, title: '把目标变成行动', description: '记录学习计划，勾选每一个完成项，积累看得见的小进步。' },
  { icon: Microphone, title: '换种方式表达', description: '在支持的浏览器中使用语音输入，让提问更加自然。' }
]
</script>
<template>
  <div class="page-width about-page"><section class="about-intro surface"><span class="about-mark"><el-icon><Reading /></el-icon></span><span class="eyebrow">关于学思智答</span><h2>学习路上，多一个伙伴。</h2><p>保持好奇，认真思考。这里是一个可以自由提问、<br>整理思路和规划学习的安静空间。</p></section><div class="feature-grid"><section v-for="feature in features" :key="feature.title" class="surface feature-card"><span class="feature-icon"><el-icon><component :is="feature.icon" /></el-icon></span><h3>{{ feature.title }}</h3><p>{{ feature.description }}</p></section></div><section class="local-note"><strong>你的记录，保存在当前浏览器</strong><p>聊天历史支持刷新恢复。清除浏览器数据会移除本地历史，记录暂不支持跨设备同步。</p></section><p class="about-footnote">AI 回答仅供学习参考，重要结论请结合教材和可靠资料核实。</p></div>
</template>
