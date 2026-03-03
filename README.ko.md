# Felo AI

**무엇이든 물어보고, AI로 최신 답을 받으세요.**

Felo AI는 터미널 CLI와 Claude Code 스킬을 제공하며, 한국어·영어·중국어(간체·번체)·일본어를 지원합니다.

[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 두 가지 핵심 기능

Felo AI의 핵심 기능은 **실시간 검색**과 **PPT 생성**입니다. 터미널 CLI로 사용하거나 Claude Code 스킬로 사용할 수 있으며, 검색은 자동으로 트리거됩니다.

### 기능 1: 실시간 검색

최신 정보를 검색하고 AI가 정리한 답변을 받습니다. 날씨, 뉴스, 가격, 문서, 기술 동향 등 「지금」 정보가 필요할 때 적합합니다.

- **다국어 지원**: 원하는 언어로 질문하면 됩니다.
- **터미널**: `felo search "질문"`
- **Claude Code**: 스킬 설치 후 자동 트리거, 또는 `/felo-ai 질문` 입력
- **예시**: `felo search "서울 날씨"`, `felo search "React 19 new features" --verbose`

### 기능 2: PPT 생성

주제나 설명을 한 문장으로 주면 PPT를 자동 생성합니다. 작업은 클라우드에서 실행되며, 완료 후 **온라인 문서 링크**를 반환해 브라우저에서 열어 확인·편집할 수 있습니다.

- **터미널**: `felo slides "주제 또는 설명"`
- **예시**: `felo slides "Felo 제품 소개, 3장"`, `felo slides "Introduction to React" --poll-timeout 300`

---

## 설치 및 설정

### CLI 설치

```bash
npm install -g felo-ai
```

설치 없이 실행: `npx felo-ai search "서울 날씨"`  
설치 후 사용하는 명령은 `felo` 입니다.

### API 키 설정

권장(영구 저장):

```bash
felo config set FELO_API_KEY your-api-key-here
```

또는 환경 변수: `export FELO_API_KEY="your-api-key-here"` (Linux/macOS), `$env:FELO_API_KEY="your-api-key-here"` (Windows PowerShell).

API 키는 [felo.ai](https://felo.ai)(설정 → API Keys)에서 발급받을 수 있습니다.

### 명령어 요약

| 명령 | 설명 |
|------|------|
| `felo search "<query>"` | 실시간 검색 |
| `felo slides "<prompt>"` | PPT 생성 |
| `felo config set FELO_API_KEY <key>` | API 키 저장 |
| `felo config get/list/path/unset` | 설정 조회/목록/경로/삭제 |

---

## Claude Code 스킬

스킬 설치:

```bash
npx @claude/skills add felo-ai
```

`FELO_API_KEY` 설정 후, Claude Code에서 「서울 오늘 날씨」「React 19 새 기능」 같은 질문을 하면 검색이 자동으로 실행됩니다. PPT 생성은 현재 터미널의 `felo slides` 로만 지원됩니다.

---

## 링크

- [Felo 오픈 플랫폼](https://openapi.felo.ai/docs/) — API 키 발급
- [API 문서](https://openapi.felo.ai/docs/api-reference/v2/chat.html)
- [더 많은 예시](./docs/EXAMPLES.md) | [FAQ](./docs/FAQ.md) | [GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues)

---

**다른 언어 / Other languages:** [简体中文](README.zh-CN.md) | [English](README.en.md) | [日本語](README.ja.md) | [繁體中文](README.zh-TW.md)
