<script setup>
import { ChatDotRound, Collection, CircleCheck, Microphone, ArrowRight } from '@element-plus/icons-vue'

const features = [
  { icon: ChatDotRound, title: '智能答疑', description: '支持连续追问，回复随生成逐步显示。' },
  { icon: Collection, title: '公式与代码', description: '支持 Markdown、数学公式和常用语言的代码高亮。' },
  { icon: CircleCheck, title: '学习计划', description: '添加学习任务，标记完成，并查看完成进度。' },
  { icon: Microphone, title: '语音输入', description: '在支持的浏览器中，可将语音识别为文字。' }
]
</script>

<template>
  <article class="about-document">
    <header class="about-heading">
      <p class="about-label">关于平台</p>
      <h1>知慧</h1>
      <p class="about-description">用 AI 答疑、理解知识，整理你的学习计划。</p>
      <RouterLink class="about-action" :to="{ name: 'ai' }">
        开始对话 <el-icon><ArrowRight /></el-icon>
      </RouterLink>
    </header>

    <section aria-labelledby="about-features">
      <h3 id="about-features">主要功能</h3>
      <ul class="about-features">
        <li v-for="feature in features" :key="feature.title">
          <span class="feature-symbol" aria-hidden="true"><el-icon><component :is="feature.icon" /></el-icon></span>
          <div>
            <h4>{{ feature.title }}</h4>
            <p>{{ feature.description }}</p>
          </div>
        </li>
      </ul>
    </section>

    <footer class="about-notes">
      <div>
        <h3>聊天记录</h3>
        <p>历史记录保存在当前浏览器，刷新后可恢复。清除浏览器数据会移除记录，暂不支持跨设备同步。</p>
      </div>
      <div>
        <h3>使用提示</h3>
        <p>AI 回答仅供学习参考，重要结论请结合教材和可靠资料核实。</p>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.about-document {
  max-width: 1160px;
  margin-inline: auto;
  padding-block: clamp(4px, 3vw, 36px) 16px;
  color: #111;
}

.about-heading { margin-bottom: 40px; }
.about-label { margin-bottom: 18px; color: #595959; font-size: 13px; font-weight: 600; }
.about-heading h1 {
  font-size: clamp(36px, 5vw, 40px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -.045em;
}
.about-description { margin-top: 12px; color: #555; font-size: 15px; line-height: 1.65; }
.about-action {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 22px;
  padding: 11px 15px;
  border-radius: 8px;
  background: #111;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}
.about-action:hover { background: #292929; }

#about-features { margin-bottom: 14px; font-size: 15px; font-weight: 650; }
.about-features {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(14px, 1.5vw, 22px);
  list-style: none;
}
.about-features li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 20px rgb(0 0 0 / 3%);
}
.feature-symbol { display: inline-flex; flex-shrink: 0; margin-top: 2px; font-size: 19px; }
.about-features h4 { margin-bottom: 4px; font-size: 14px; font-weight: 650; }
.about-features p { color: #555; font-size: 13px; line-height: 1.65; }

.about-notes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}
.about-notes h3 { margin-bottom: 4px; color: #444; font-size: 12px; }
.about-notes p { color: #666; font-size: 12px; line-height: 1.7; }
@media (max-width: 680px) {
  .about-features, .about-notes { grid-template-columns: 1fr; }
  .about-heading { margin-bottom: 30px; }
  .about-notes { gap: 12px; }
}
</style>
