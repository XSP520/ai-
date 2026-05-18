# 🧠 AI 进化之路

从零基础到 AI 应用开发的结构化学习路线网站，一个纯前端单页应用。

## 功能特性

- **学习路线可视化**：垂直时间线展示 6 个连续学习阶段
- **深度知识点讲解**：每个主题含 400+ 字结构化讲解（概念解释、核心要点、代码示例、常见误区、延伸思考等 7 大模块）
- **代码语法高亮**：使用 react-syntax-highlighter（Prism）渲染代码块，注释与代码以不同颜色区分
- **学习进度跟踪**：勾选完成主题和项目，进度自动保存至 localStorage
- **学习反馈与激励**：Toast 提示、阶段完成徽章、成就墙、累计学习天数
- **暗黑模式**：一键切换，偏好自动保存
- **个人笔记**：每个阶段可记录学习心得
- **响应式设计**：完美适配桌面、平板、手机
- **趣味设计**：漂浮 AI 图标动画，渐变边框光晕，SVG 渐变进度环

## 技术栈

- Vite + React 18
- Tailwind CSS + @tailwindcss/typography
- React Router v6
- react-markdown + react-syntax-highlighter
- React Context（主题模式）

## 安装与启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
  components/    # 共享组件（Navbar, Footer, Timeline, StageCard, ProgressRing, Toast, FloatingIcons）
  pages/         # 页面组件（Home, Roadmap, StageDetail, Progress）
  data/          # 学习内容数据（6 个阶段 34+ 主题，每个 400+ 字含代码示例）
  hooks/         # 自定义 Hooks（useLocalStorage, useProgress）
  context/       # React Context（ThemeContext）
  App.jsx        # 路由与布局
  main.jsx       # 入口文件
  index.css      # Tailwind 指令与自定义样式
```

## 学习路线

1. **AI 思维启蒙**（1～2 周）- AI 基本概念、工具使用、提示工程、伦理思考
2. **编程基础 - Python**（4～6 周）- 环境搭建、控制流、函数、数据结构、面向对象
3. **数学与数据基础**（4～6 周）- 线性代数、概率论、NumPy、Pandas、数据可视化
4. **机器学习入门**（6～8 周）- 监督学习、回归、决策树、KMeans、过拟合、特征工程
5. **深度学习与框架**（8～12 周）- 神经网络、CNN、RNN、PyTorch、迁移学习、训练调优
6. **AI 应用开发与部署**（持续）- FastAPI、Docker、LLM API、RAG、Agents、Streamlit 部署
