# 知慧｜AI 学习助手

一个面向学习场景的 AI 对话与学习计划应用。前端使用 Vue 3 构建，后端通过讯飞 MaaS 提供流式问答；支持会话本地恢复、Markdown 内容展示和待办计划管理。

## 功能亮点

- **AI 流式答疑**：通过 Fetch 与 ReadableStream 逐段接收 SSE 回复，支持停止生成，并使用请求标识避免切换会话后串写。
- **多会话历史**：使用 Pinia 管理会话，通过 localStorage 延迟保存并在刷新后恢复；空白会话不会进入历史记录。
- **长列表优化**：使用 `vue-virtual-scroller` 动态测量并虚拟渲染聊天消息。
- **结构化消息展示**：使用 Markdown-it 渲染 Markdown，支持 KaTeX 公式与 Highlight.js 常用代码语言高亮。
- **学习计划管理**：支持新增、完成、全选和批量删除待办事项，并显示完成进度。
- **语音输入**：在浏览器支持 Web Speech API 时，可将语音识别结果填入输入框。
- **响应式界面**：为桌面与窄屏布局提供适配。

## 技术栈

- 前端：Vue 3、Vite、Pinia、Vue Router、Element Plus
- 消息渲染：Markdown-it、KaTeX、Highlight.js
- 虚拟滚动：vue-virtual-scroller
- 后端：Node.js 原生 HTTP/HTTPS、dotenv
- AI 服务：讯飞 MaaS（当前模型配置在 `backend/index.js`）

## 本地运行

需要 Node.js 20.19+ 或 22.12+，并准备可用的讯飞 MaaS API Key。

### 1. 安装依赖

在项目根目录运行：

```bash
npm install
```

再安装后端依赖：

```bash
cd backend
npm install
cd ..
```

### 2. 配置后端密钥

复制 `backend/.env.example` 为 `backend/.env`，并填写自己的 API Key：

```env
XUNFEI_API_KEY=你的讯飞API密钥
PORT=3000
```

`backend/.env` 已被 Git 忽略，不要把真实密钥提交到 GitHub。

### 3. 分别启动后端和前端

在第一个终端启动后端：

```bash
cd backend
npm run dev
```

在第二个终端从项目根目录启动前端：

```bash
npm run dev
```

浏览器访问 Vite 显示的本地地址，通常为 `http://localhost:5173`；AI 对话页面路径为 `/ai`。后端健康检查地址为 `http://localhost:3000/health`。

## 项目结构

```text
src/
├── components/       # 聊天消息、待办条目组件
├── stores/           # Pinia：聊天会话与待办状态
├── views/            # 首页、AI 对话、学习计划、关于页面
├── router/           # Vue Router 配置
├── App.vue           # 工作台布局与导航
└── main.js           # 应用入口
backend/
├── index.js          # HTTP API 与讯飞流式代理
└── .env.example      # 环境变量示例（不含真实密钥）
```

## 构建

```bash
npm run build
```

构建产物输出到 `dist/`。该项目当前以本地开发和作品展示为主；如果要公开部署，需要另行配置后端托管、生产环境 API 地址和密钥保护。
