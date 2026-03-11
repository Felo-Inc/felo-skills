# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-03-11

### Added

- **`felo superagent` 新增选项**：`--thread-id`（继续对话）、`--skill-id`、`--selected-resource-ids`、`--ext`（仅新建会话）
- **`felo livedocs` 命令**：列举 LiveDoc 列表，支持分页（`--page`、`--size`）和关键词过滤（`--keyword`）
- **`felo livedoc-resources <id>` 命令**：查看指定 LiveDoc 下的资源列表
- **`FELO_API_BASE` 配置持久化**：支持通过 `felo config set FELO_API_BASE <url>` 持久化 API 地址，优先级：环境变量 > config > 默认值

### Changed

- SuperAgent 流式事件 `type=processing` 改为静默忽略，不再输出到 stderr

---

## [0.2.7] - 2025-03-06

### Breaking Changes

- **CLI 命令与技能重命名：web extract → web fetch**
  - 命令 `felo web-extract` 已更名为 `felo web-fetch`，请更新脚本与文档。
  - 独立脚本路径由 `felo-web-extract/scripts/run_web_extract.mjs` 改为 `felo-web-fetch/scripts/run_web_fetch.mjs`。
  - 技能/目录名由 `felo-web-extract` 改为 `felo-web-fetch`；触发词示例：`/felo-web-fetch`、`use felo web fetch`。
  - 后端 API 路径未变（仍为 `POST /v2/web/extract`），仅产品对外名称改为「Web Fetch」。

### Changed

- 产品名称统一为「Web Fetch」：README、SKILL、package 描述与关键词已同步更新。
- `felo-youtube-subtitling` 技能中「网页内容」相关引用已更新为 `felo-web-fetch`。

---

## [0.2.6] - (previous)

Earlier releases: search, slides, web fetch, youtube-subtitling features.

[0.3.0]: https://github.com/Felo-Inc/felo-skills/compare/v0.2.7...v0.3.0
[0.2.7]: https://github.com/Felo-Inc/felo-skills/compare/v0.2.6...v0.2.7
[0.2.6]: https://github.com/Felo-Inc/felo-skills/releases/tag/v0.2.6
