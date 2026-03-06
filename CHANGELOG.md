# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

Earlier releases: search, slides, web extract, youtube-subtitling features.

[0.2.7]: https://github.com/Felo-Inc/felo-skills/compare/v0.2.6...v0.2.7
[0.2.6]: https://github.com/Felo-Inc/felo-skills/releases/tag/v0.2.6
