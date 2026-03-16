# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.25] - 2026-03-17

### Added

- **`felo livedoc download <id> <resource_id>`**: download a resource's source file directly to disk; follows the 302 redirect to the S3 presigned URL and streams the file; supports `--output <path>` to specify the destination filename (defaults to the filename from the `Content-Disposition` header)
- **`felo livedoc content <id> <resource_id>`**: fetch the extracted text content of a resource; supported for document, web, video, ai_doc, ai_ppt, text, voice, and mindmap types
- **`felo livedoc ppt-retrieve <id>`**: deep content retrieval from a specific PPT slide page; requires `--resource-id`, `--page-number`, and `--query`; supports `--max-chunk` (default 3); output format is identical to `retrieve`
- **`add-urls` custom title support**: the API now accepts each URL entry as either a plain string or a `{"url": "...", "title": "..."}` object, allowing custom resource titles when adding URLs

---

## [0.2.18] - 2026-03-14

### Added

- **`felo livedoc route <id>`**: add `route` subcommand to CLI for routing relevant resource IDs by query; supports `--max-resources` flag
- **`felo livedoc retrieve` `--resource-ids`**: add `--resource-ids` option to search within specific resources (comma-separated)

### Fixed

- Fix `retrieve` request body field from `content` to `query`

---

## [0.2.17] - 2026-03-14

### Added

- **`felo livedoc route <id>`**: route relevant resource IDs by query for targeted retrieval; supports `--max-resources`
- **`felo livedoc retrieve` `--resource-ids`**: specify resource IDs to search within (comma-separated, max 50); auto-routes when omitted

### Changed

- `felo livedoc retrieve`: renamed request field `content` to `query` to align with backend API

### Fixed

- Fixed truncated README in `felo-livedoc` (was cut off at 53 lines)

---

## [0.2.14] - 2026-03-13

### Added

- **`felo livedoc` command**: full CRUD for LiveDocs (knowledge bases) — `create`, `list`, `update`, `delete`
- **`felo livedoc` resource management**: `add-doc`, `add-urls`, `upload`, `resources`, `resource`, `remove-resource`
- **`felo livedoc retrieve <id>`**: semantic search across resources in a LiveDoc
- **`felo superagent` new options**: `--thread-id` (follow-up conversation), `--skill-id`, `--selected-resource-ids`, `--ext`
- **`FELO_API_BASE` config persistence**: support `felo config set FELO_API_BASE <url>`, priority: env > config > default

### Changed

- SuperAgent SSE `type=processing` events are now silently ignored
- Replaced all hardcoded Chinese strings with English in superAgent

---

## [0.2.12] - 2026-03-10

Streamline the process and reduce the need for confirmation and selection.

## [0.2.10] - 2026-03-10

### Fixed

- 修复 `felo-x-search` API 请求路径缺少 `/v2` 前缀的问题。

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

[0.2.10]: https://github.com/Felo-Inc/felo-skills/compare/v0.2.9...v0.2.10
[0.2.7]: https://github.com/Felo-Inc/felo-skills/compare/v0.2.6...v0.2.7
[0.2.6]: https://github.com/Felo-Inc/felo-skills/releases/tag/v0.2.6
