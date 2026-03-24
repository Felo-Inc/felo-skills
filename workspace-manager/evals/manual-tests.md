# Workspace Manager 手动测试场景

这些场景需要多终端协作，无法自动化，需手动验证。

## G1 — 两个 Agent 同时 append-readme

**步骤：**
1. 开两个终端，各自加载三菱银行工作区
2. 终端 A：执行一个调研任务，触发 append-readme
3. 终端 B：同时执行另一个调研任务，触发 append-readme

**验证：**
- 调用 get-readme 确认两条内容都保留
- 无数据丢失（append 是追加，不覆盖）

## G2 — 两个 Agent 同时创建 task

**步骤：**
1. 开两个终端，各自加载三菱银行工作区
2. 终端 A：执行任务 X，触发 create-task
3. 终端 B：同时执行任务 Y，触发 create-task

**验证：**
- 调用 tasks 确认两条 task 都存在
- 各自 task_id 不同，互不干扰
