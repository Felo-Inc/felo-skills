# Felo Slides Skill for Claude Code

在 Claude Code 中通过 Felo PPT Task API 生成幻灯片（异步任务）。

## 功能

- 根据一句主题或描述生成 PPT
- 自动轮询任务状态直到完成/失败/超时
- 完成后返回在线文档链接（`live_doc_url`）
- 返回 `task_id`，便于后续继续查询任务结果

## 快速开始

### 1. 安装 skill

```bash
npx @claude/skills add felo-slides
```

如果你是本地仓库使用者，也可以手动复制：

```bash
# Linux/macOS
cp -r felo-slides ~/.claude/skills/

# Windows (PowerShell)
Copy-Item -Recurse felo-slides "$env:USERPROFILE\.claude\skills\"
```

### 2. 配置 API Key

先在 [felo.ai](https://felo.ai) -> Settings -> API Keys 获取密钥，再设置环境变量：

```bash
# Linux/macOS
export FELO_API_KEY="your-api-key-here"
```

```powershell
# Windows PowerShell
$env:FELO_API_KEY="your-api-key-here"
```

### 3. 触发方式

- 意图触发：例如“帮我做一份融资路演 PPT，10 页”
- 显式触发：`/felo-slides 你的主题`

## 使用示例

```text
你：帮我生成一份《Felo 产品介绍》PPT，3 页，面向开发者
Claude：返回任务创建结果，轮询状态，最终给出 live_doc_url
```

```text
你：/felo-slides Introduction to React, 8 slides for beginners
Claude：返回 task_id、状态和 live_doc_url
```

```text
你：做一份季度复盘总结，包含目标达成、问题、改进计划
Claude：创建任务并在完成后输出在线文档链接
```

## API 工作流

基于官方 v2 PPT Task API：

1. 创建任务：`POST /v2/ppts`
2. 查询状态：`GET /v2/tasks/{task_id}/status`（可选）
3. 查询历史/结果：`GET /v2/tasks/{task_id}/historical`

推荐轮询间隔 2-5 秒；本 skill 默认按 10 秒轮询，超时上限 600 秒。检测到 `COMPLETED`/`SUCCESS` 后会立即停止轮询并返回 `live_doc_url`。轮询模板不依赖 `jq`。

Skill 内部可直接调用脚本：

```bash
node felo-slides/scripts/run_ppt_task.mjs --query "Felo 产品介绍，3 页" --interval 10 --max-wait 600
```

## 常见问题

### 1) `FELO_API_KEY` 未配置

请先设置环境变量并重启 Claude Code 会话。

### 2) `INVALID_API_KEY`

密钥无效或已撤销，请到 [felo.ai](https://felo.ai) 重新生成。

### 3) 长时间未完成

任务可能仍在排队或处理中。skill 会在超时后返回 `task_id`，可稍后重试并继续查询。

### 4) 已完成但没有 `live_doc_url`

返回结构异常，建议携带 `task_id` 重新查询 historical 接口。

## 相关链接

- [PPT Task API 文档](https://openapi.felo.ai/docs/api-reference/v2/ppt-tasks.html)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
- [获取 API Key](https://felo.ai)
