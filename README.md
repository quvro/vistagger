# VisTagger

轻量级绘画参考软件 — 结构化属性 + 自然语言搜索

## 技术栈

- **前端**: React + TypeScript + TailwindCSS + Zustand
- **后端**: Tauri v2 (Rust)
- **数据库**: SQLite
- **AI**: Claude Vision API 结构化属性识别（本地模型待扩展）

## 开发

```bash
npm install
npm run tauri dev
```

## 系统依赖

```bash
sudo apt-get install -y build-essential \
  libwebkit2gtk-4.1-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev \
  libjavascriptcoregtk-4.1-dev libsoup-3.0-dev
```

## 进度

| Step | 内容 | 状态 |
|------|------|------|
| 1 | 项目脚手架 | ✅ |
| 2 | 图片导入 + 结构化属性模型 | ✅ |
| 3 | 属性管理面板 + 交互完善 | ✅ |
| 4 | AI 结构化识别 (Claude Vision API) | ✅ |
| 5 | 搜索 + 截图 | 待开始 |
| 6 | 浮窗 + 收藏夹 | 待开始 |
