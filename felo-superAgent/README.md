# Felo SuperAgent Skill for Claude Code

**AI 对话与流式输出，支持连续会话。**

通过 Felo Open Platform 的 SuperAgent API，在 Claude Code 中发起与 SuperAgent 的对话、接收 SSE 流式回复，并可查询会话详情。

---

## 功能

- **流式对话**：创建会话后通过 SSE 实时接收 AI 回复
- **LiveDoc 关联**：每次会话对应一个 LiveDoc，可后续查看资源
- **连续对话**：通过 `--thread-id` 在已有会话上继续提问
- **LiveDoc 管理**：列举 LiveDoc 列表、查看指定 LiveDoc 下的资源
- **多语言**：支持 `accept_language`（如 zh / en）
- **工具调用**：支持生图、研究报告、文档、PPT、HTML、Twitter 搜索等工具

**适用场景：**

- 需要 SuperAgent 流式回答
- 需要与 LiveDoc 关联、可追溯资源的对话
- 多轮/连续对话（复用同一 LiveDoc）

**不适用：**

- 仅需单次实时信息检索 → 使用 `felo-search`
- 仅需抓取网页正文 → 使用 `felo-web-fetch`
- 仅需生成 PPT → 使用 `felo-slides`
- 需要 LiveDoc 知识库功能 → 使用 `felo-livedoc`

---

## 快速开始

### 1. 安装

**一键安装（推荐）：**

```bash
npx skills add Felo-Inc/felo-skills --skill felo-superAgent
```

**手动安装：** 若上述命令不可用，从本仓库复制到 Claude Code 的 skills 目录：

```bash
# Linux/macOS
cp -r felo-superAgent ~/.claude/skills/

# Windows (PowerShell)
Copy-Item -Recurse felo-superAgent "$env:USERPROFILE\.claude\skills\"
```

（若为本地 skill，确保 Cursor/Claude Code 已配置该 skill 路径。）

### 2. 配置 API Key

与其它 Felo skills 相同，使用同一 API Key：

1. 打开 [felo.ai](https://felo.ai) 登录
2. 头像 → **Settings** → **API Keys** → 创建并复制 Key
3. 设置环境变量：

```bash
# Linux/macOS
export FELO_API_KEY="your-api-key-here"

# Windows PowerShell
$env:FELO_API_KEY="your-api-key-here"
```

### 3. 使用方式

**在对话中触发：**

- 明确指令：`/felo-superagent`、"use felo super agent"
- 描述意图：SuperAgent 对话、流式对话、LiveDoc 对话、连续对话

**命令行直接跑脚本：**

```bash
node felo-superAgent/scripts/run_superagent.mjs --query "What is the latest news about AI?"
```

输出为流式汇总后的完整回答正文。加 `--json` 可得到包含 `thread_short_id`、`live_doc_short_id` 的 JSON。

**CLI 命令（安装后）：**

```bash
# SuperAgent 对话
felo superagent "What is the latest news about AI?"

# 继续对话
felo superagent "Tell me more" --thread-id <thread_short_id>

# 列举 LiveDoc 列表
felo livedocs
felo livedocs --page 2 --size 10
felo livedocs --keyword AI

# 查看指定 LiveDoc 下的资源
felo livedoc-resources <livedoc-id>
```

---

## 脚本参数

### superagent

| 参数                              | 说明                                                       |
| --------------------------------- | ---------------------------------------------------------- |
| `--query <text>`                  | 用户问题（必填，1–2000 字符）                              |
| `--thread-id <id>`               | 已有会话 ID，用于继续对话                                  |
| `--live-doc-id <id>`             | 复用已有 LiveDoc short_id（连续对话）                      |
| `--skill-id <id>`                | Skill ID（仅新建会话时有效）                               |
| `--selected-resource-ids <ids>`  | 逗号分隔的资源 ID（仅新建会话时有效）                      |
| `--ext <json>`                   | 额外参数 JSON，如 `'{"style_id":"xxx"}'`（仅新建会话时有效）|
| `--accept-language <lang>`       | 语言偏好，如 zh / en                                       |
| `--timeout <seconds>`            | 请求/流超时，默认 60                                       |
| `--json`                         | 输出 JSON（含 answer、thread_short_id、live_doc_short_id） |
| `--verbose`                      | 将流连接信息打到 stderr                                    |

### livedocs

| 参数                    | 说明                     |
| ----------------------- | ------------------------ |
| `-p, --page <number>`  | 页码，默认 1             |
| `-s, --size <number>`  | 每页条数，默认 20        |
| `-k, --keyword <text>` | 关键词过滤               |
| `-j, --json`           | 输出原始 JSON            |
| `-t, --timeout <seconds>` | 请求超时，默认 60     |

### livedoc-resources

| 参数                       | 说明                     |
| -------------------------- | ------------------------ |
| `<livedoc-id>`            | LiveDoc short_id（必填） |
| `-j, --json`              | 输出原始 JSON            |
| `-t, --timeout <seconds>` | 请求超时，默认 60        |

---

## 输出格式

**默认（纯文本）：**  
脚本 stdout 为完整回答内容（由 SSE `message` 事件拼接）。

**`--json`：**  
单行 JSON 对象，例如：

```json
{
  "status": "ok",
  "data": {
    "answer": "完整回答内容...",
    "thread_short_id": "TvyKouzJirXjFdst4uKRK3",
    "live_doc_short_id": "PvyKouzJirXjFdst4uKRK3"
  }
}
```

可用 `thread_short_id` 调用「查询会话详情」接口，`live_doc_short_id` 可传入 `felo-livedoc` 查询相关资源。

---

## 错误处理

常见错误码参见 [SuperAgent API 文档](https://openapi.felo.ai/docs/api-reference/v2/superagent.html)：

- `INVALID_API_KEY` (401)：Key 无效或已撤销
- `SUPER_AGENT_CONVERSATION_CREATE_FAILED` (502)：创建会话失败
- 其它 502：下游服务异常，可重试或联系支持

若未配置 `FELO_API_KEY`，脚本会报错并提示配置方法。

---

## 参考链接

- [SuperAgent API 文档](https://openapi.felo.ai/docs/api-reference/v2/superagent.html)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
