# Felo AI

**随时提问，用 AI 获取当下最新答案。**

Felo AI 提供终端 CLI 与 Claude Code 技能，支持简体中文、英文、日文、韩文、繁体中文等多语言。

[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 两大能力

Felo AI 提供两个核心能力：**实时搜索** 与 **PPT 生成**。可在终端用 CLI 使用，也可在 Claude Code 中通过技能使用（搜索支持自动触发）。

### 能力一：实时搜索

联网搜索最新信息，由 AI 整合成可直接使用的回答。适合查天气、新闻、价格、文档、技术动态等一切需要「当下」信息的场景。

- **支持多语言**：用你习惯的语言提问即可。
- **终端**：`felo search "你的问题"`
- **Claude Code**：安装技能后自动触发，或输入 `/felo-ai 你的问题`
- **示例**：`felo search "杭州明天天气"`、`felo search "React 19 new features" --verbose`

### 能力二：生成 PPT

根据一句描述或主题，自动生成 PPT。任务在云端执行，完成后返回**在线文档链接**，浏览器打开即可查看/编辑。

- **终端**：`felo slides "你的主题或描述"`
- **示例**：`felo slides "Felo 产品介绍，3 页"`、`felo slides "Introduction to React" --poll-timeout 300`

---

## 安装与配置

### 安装 CLI

```bash
npm install -g felo-ai
```

不安装直接运行：`npx felo-ai search "东京天气"`  
安装后命令为 `felo`。

### 配置 API Key

推荐（持久保存）：

```bash
felo config set FELO_API_KEY your-api-key-here
```

或设置环境变量：`export FELO_API_KEY="your-api-key-here"`（Linux/macOS），`$env:FELO_API_KEY="your-api-key-here"`（Windows PowerShell）。

API Key 请在 [felo.ai](https://felo.ai)（设置 → API Keys）获取。

### 命令一览

| 命令 | 说明 |
|------|------|
| `felo search "<query>"` | 实时搜索 |
| `felo slides "<prompt>"` | 生成 PPT |
| `felo config set FELO_API_KEY <key>` | 保存 API Key |
| `felo config get/list/path/unset` | 查看/列出/定位/删除配置 |

---

## Claude Code 技能

安装技能：

```bash
npx @claude/skills add felo-ai
```

配置 `FELO_API_KEY` 后，在 Claude Code 中问「东京今天天气」「React 19 新特性」等问题会自动触发搜索。PPT 生成目前仅支持终端 `felo slides`。

---

## 链接

- [Felo 开放平台](https://openapi.felo.ai/docs/) — 获取 API Key
- [API 文档](https://openapi.felo.ai/docs/api-reference/v2/chat.html)
- [更多示例](./docs/EXAMPLES.md) | [FAQ](./docs/FAQ.md) | [GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues)

---

**其他语言 / Other languages:** [English](README.en.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [繁體中文](README.zh-TW.md)
