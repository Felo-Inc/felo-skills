# Felo AI

**隨時提問，用 AI 取得當下最新答案。**

Felo AI 提供終端 CLI 與 Claude Code 技能，支援繁體中文、簡體中文、英文、日文、韓文等多語言。

[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 兩大能力

Felo AI 提供兩個核心能力：**即時搜尋** 與 **PPT 生成**。可在終端用 CLI 使用，也可在 Claude Code 中透過技能使用（搜尋支援自動觸發）。

### 能力一：即時搜尋

連網搜尋最新資訊，由 AI 整合成可直接使用的回答。適合查天氣、新聞、價格、文件、技術動態等一切需要「當下」資訊的場景。

- **支援多語言**：用你習慣的語言提問即可。
- **終端**：`felo search "你的問題"`
- **Claude Code**：安裝技能後自動觸發，或輸入 `/felo-ai 你的問題`
- **範例**：`felo search "台北明天天氣"`、`felo search "React 19 new features" --verbose`

### 能力二：生成 PPT

根據一句描述或主題，自動生成一份 PPT。任務在雲端執行，完成後回傳**線上文件連結**，可直接在瀏覽器開啟檢視/編輯。

- **終端**：`felo slides "你的主題或描述"`
- **範例**：`felo slides "Felo 產品介紹，3 頁"`、`felo slides "Introduction to React" --poll-timeout 300`

---

## 安裝與設定

### 安裝 CLI

```bash
npm install -g felo-ai
```

不安裝直接執行：`npx felo-ai search "東京天氣"`  
安裝後指令為 `felo`。

### 設定 API Key

建議（持久保存）：

```bash
felo config set FELO_API_KEY your-api-key-here
```

或設定環境變數：`export FELO_API_KEY="your-api-key-here"`（Linux/macOS），`$env:FELO_API_KEY="your-api-key-here"`（Windows PowerShell）。

API Key 請至 [felo.ai](https://felo.ai)（設定 → API Keys）取得。

### 指令一覽

| 指令 | 說明 |
|------|------|
| `felo search "<query>"` | 即時搜尋 |
| `felo slides "<prompt>"` | 生成 PPT |
| `felo config set FELO_API_KEY <key>` | 儲存 API Key |
| `felo config get/list/path/unset` | 檢視/列出/路徑/刪除設定 |

---

## Claude Code 技能

安裝技能：

```bash
npx @claude/skills add felo-ai
```

設定 `FELO_API_KEY` 後，在 Claude Code 中詢問「東京今天天氣」「React 19 新特性」等問題會自動觸發搜尋。PPT 生成目前僅支援終端 `felo slides`。

---

## 連結

- [Felo 開放平台](https://openapi.felo.ai/docs/) — 取得 API Key
- [API 文件](https://openapi.felo.ai/docs/api-reference/v2/chat.html)
- [更多範例](./docs/EXAMPLES.md) | [FAQ](./docs/FAQ.md) | [GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues)

---

**其他語言 / Other languages:** [简体中文](README.zh-CN.md) | [English](README.en.md) | [日本語](README.ja.md) | [한국어](README.ko.md)
