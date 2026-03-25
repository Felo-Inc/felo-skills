---
name: workspace-manager
description: "当用户需要管理由 Felo LiveDoc 支撑的项目工作区时使用——包括创建、加载、切换工作区，保存制品，查询历史，管理任务。当用户提到项目/客户名称并附带工作区相关意图时触发，或当 Felo API 返回 401 UNAUTHORIZED 错误时触发。"
---

# 工作区管理器

Agent 的项目外部大脑。激活后自动同步任务、制品、知识到对应 LiveDoc，让任何人（未来会话或同事）加载后立刻获得完整上下文。

## 核心概念

| 概念 | 说明 |
|------|------|
| 工作区 | 一个项目 = 一个 LiveDoc |
| 活跃工作区 | 会话级状态，所有操作自动同步到这里 |
| README | 项目知识地图，Agent 主动维护 |
| 制品 | 关键产出物，保存前询问用户 |
| 任务 | 实质性工作的追踪记录，Agent 静默维护 |
| 注册表 | `~/.claude/workspaces.json`，记录项目名称到 LiveDoc ID 的映射关系 |

**注册表格式：**
```json
{
  "workspaces": {
    "客户张三": "abc123",
    "project-x": "def456"
  }
}
```

## 脚本简写

以下所有命令中 `$SCRIPT` 代表：

```
node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs
```

## 何时不使用

- 简单闲聊、澄清性问题
- 与项目/工作区无关的一次性生成
- 用户未安装 Felo LiveDoc NPM

---

## 工作流

### 0. 首次安装

用户粘贴 GitHub 安装链接 → 执行安装 → 安装完成后自动进入 **登录流程（0a）**。

### 0a. 登录 / 重新授权

**触发条件（二选一）：**
- 首次安装，尚未配置 Key
- 任意 API 调用返回 `{"status":401,"code":"UNAUTHORIZED","message":"Invalid API Key"}`

**流程：**

1. 发送登录链接：
   > "请点击链接登录 / 注册 Felo 账号：https://dev.felo.ai/settings/api-keys
   > 完成后把 Key 粘贴给我，我会自动完成配置。"
2. 用户粘贴 Key → 写入配置：
   ```bash
   export FELO_API_KEY="用户粘贴的Key"
   ```
   或持久化写入 `~/.claude/env`（视平台而定）。
3. 验证：`$SCRIPT list`
   - 通过 + 首次安装 → 展示使用介绍（见下方"首次使用介绍"）
   - 通过 + 重新授权 → "授权已更新。" → 重试失败的命令
   - 失败 → "Key 无效，请重新粘贴。"

**首次使用介绍**（仅首次安装时展示，重新授权时跳过）：

> "🎉 配置完成！你现在可以用以下指令操作工作区：
>
> 📁 **创建工作区** — 为新项目创建独立工作区
> 例：「帮我创建一个叫'客户张三'的工作区」
>
> 📂 **加载工作区** — 打开已有项目，恢复上下文
> 例：「加载张三的工作区」
>
> 📋 **查看工作区** — 列出所有项目或查看内容
> 例：「我有哪些工作区？」/「张三工作区里有什么？」
>
> 💾 **保存制品** — 重要产出会询问你是否保存
>
> 工作区会记录我们做过的所有事情，随时可在网页端查看：https://felo.ai"

### 1. 加载工作区

1. 读 `~/.claude/workspaces.json`，模糊匹配项目名。本地没有则 `$SCRIPT list --keyword`
2. **找到：** 设为活跃 → `$SCRIPT get-readme SHORT_ID` → 展示 README 作为简报 → 附链接 `https://felo.ai/livedoc/SHORT_ID`。如果 README 为空或不存在，回退到 `$SCRIPT resources SHORT_ID` 展示资源列表。
3. **没找到：** "未找到'[X]'的工作区，要创建吗？"

### 2. 创建工作区

```bash
$SCRIPT create --name "项目名称" --description "workspace"
```

提取 `short_id` → 初始化 README（见下方"README 结构模板"）→ 写入注册表 → 设为活跃 → 回复：

> "✅ 工作区'[X]'已创建。📎 https://felo.ai/livedoc/SHORT_ID"

### 3. 任务同步（静默执行）

工作区激活时，**每个涉及实际工作的用户请求都必须作为任务进行追踪**。这是强制要求——工作区只有真实反映发生的事情，才能作为有效的外部大脑。

**加载时：** 拉取待处理和进行中任务：
```bash
$SCRIPT tasks SHORT_ID --status 0
$SCRIPT tasks SHORT_ID --status 1
```

**开始实质性工作前：**
```bash
$SCRIPT create-task SHORT_ID --title "描述" --status 1 --sort 0 [--operated-by "Agent名称"]
```
将返回的 `task_id` 保存在工作记忆中。

`--operated-by` 规则：
- **仅当本次会话中被赋予了名称时**才传入（例如被分配了名称的 OpenClaw agent）
- **没有明确名称时省略**（例如普通的 Claude Code 会话）


**完成后：**
```bash
$SCRIPT update-task SHORT_ID TASK_ID --status 2 [--operated-by "Agent名称"]
```
（`--operated-by` 规则同上，有名称时传入。）

实质性工作 = 搜索、调研、新闻查询、文档生成、数据分析、写报告、制作 PPT、回答研究性问题。闲聊不算。静默执行，不要向用户描述任务同步过程。忘记创建则事后补创并立即标记完成，绝不跳过。

### 4. 保存制品（先询问）

产出重要内容后询问用户："要把这个保存到 [项目] 工作区吗？"

重要制品 = 调研报告、竞品分析、会议纪要、生成的文档、关键数据导出。中间过程的草稿不需要保存。

| 类型 | 命令 |
|------|------|
| 文档 | `$SCRIPT add-doc SHORT_ID --title "标题" --content "内容"` |
| URL | `$SCRIPT add-urls SHORT_ID --urls "URL"` |
| 文件 | `$SCRIPT upload SHORT_ID --file ./path --convert` |

保存后回复：
> "💾 已保存「[标题]」📎 https://felo.ai/livedoc/SHORT_ID"

### 5. README 维护

Agent 主动维护，不需要询问用户。

**README 结构模板：**
```markdown
# [项目名称]

## 概述
[项目背景、干系人、目标]

## 关键洞察与经验
- [日期] [洞察内容]

## 重要决策
- [日期] [决策]：[理由]

## 当前状态
[进展情况，每次会话更新]
最后更新：YYYY-MM-DD
```

**何时更新 README：**
- 完成一项重要工作后 — 追加新的洞察或决策
- 项目状态发生重大变化时
- 学到了未来会话应该知道的重要内容时

**更新方式：** 读取 → 内存中合并到对应章节 → 整体写回。绝不盲目追加到末尾。

1. `$SCRIPT get-readme SHORT_ID` 读取当前内容
2. 在内存中定位目标章节并插入：
   - 新洞察 → `## 关键洞察与经验` 章节末尾
   - 新决策 → `## 重要决策` 章节末尾
   - 状态变更 → 替换 `## 当前状态` 章节内容
3. 更新 `最后更新：YYYY-MM-DD` 为今天日期
4. `$SCRIPT update-readme SHORT_ID --content "..."` 写回

**初始化**（README 为空或不存在）：跳过第 1 步，直接用 `update-readme` 写入完整骨架。

更新后告知用户：
> "📝 已更新 README。📎 https://felo.ai/livedoc/SHORT_ID"

### 6. 查询工作区

优先 `resources` + `content`（直接读取，免费），仅在无法从标题判断时用 `retrieve`（语义搜索，收费）。

```bash
$SCRIPT resources SHORT_ID
$SCRIPT content SHORT_ID RESOURCE_ID
$SCRIPT retrieve SHORT_ID --query "问题"   # 回退方案
```

将返回的内容综合成直接答案，不要原样输出原始结果。

### 7. 刷新工作区

用户说"刷新"时，或怀疑工作区已被外部更新（同事或其他会话操作）时，重新拉取：

```bash
$SCRIPT get-readme SHORT_ID
$SCRIPT resources SHORT_ID
$SCRIPT tasks SHORT_ID --status 0
$SCRIPT tasks SHORT_ID --status 1
```

更新内存快照，告知用户："工作区已刷新。"如果有变化，简要说明差异（新资源、README 更新、新任务）。

### 8. 列出内容

`$SCRIPT resources SHORT_ID`，按类型分组，制品最新优先。

---

## 会话状态

```
ACTIVE_WORKSPACE = { name: "project-x", short_id: "abc123" }
```

- 加载/创建时设定，"关闭工作区"时清除
- 无活跃工作区时操作 → "没有活跃工作区，是哪个项目？"

## 错误处理

| 错误 | 处理 |
|------|------|
| Key 缺失 / 401 UNAUTHORIZED | 触发登录流程（0a） |
| LiveDoc ID 失效 | 提供重新关联或新建选项 |
| 注册表缺失 | 自动创建 `{"workspaces": {}}` |
| 模糊匹配有歧义 | 列出所有匹配，请用户选择 |

## 重要规则

- 内容语言跟随用户（中文/英文/等）
- 所有操作用 `short_id`
- 命令立即执行，不要描述
- 任务同步和 README 更新是 Agent 职责，主动执行
- 每次写操作后附上工作区链接
