# VisTagger

轻量级绘画参考软件 — 结构化属性 + 自然语言搜索

## 技术栈

- **前端**: React + TypeScript + TailwindCSS + Zustand
- **后端**: Tauri v2 (Rust)
- **数据库**: SQLite
- **AI**: CLIP embedding + 结构化属性识别

## 开发

```bash
npm install
npm run tauri dev
```

## 系统依赖

```bash
sudo apt-get install -y libwebkit2gtk-4.1-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev \
  libjavascriptcoregtk-4.1-dev libsoup-3.0-dev
```
