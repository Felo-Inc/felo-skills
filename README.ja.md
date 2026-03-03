# Felo AI

**何でも聞いて、AI で今の答えを。**

Felo AI はターミナル用 CLI と Claude Code スキルを提供し、日本語・英語・中国語（簡体・繁体）・韓国語に対応しています。

[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 2つの機能

Felo AI のコア機能は **リアルタイム検索** と **PPT 生成** です。ターミナルの CLI で使うほか、Claude Code のスキルとしても利用でき、検索は自動で発動します。

### 機能1: リアルタイム検索

最新情報を検索し、AI がまとめた回答を取得します。天気、ニュース、価格、ドキュメント、技術動向など、「今」の情報が必要なときに最適です。

- **多言語対応**: お好みの言語で質問できます。
- **ターミナル**: `felo search "質問"`
- **Claude Code**: スキル導入後は自動で発動。手動では `/felo-ai 質問`
- **例**: `felo search "東京の天気"`、`felo search "React 19 new features" --verbose`

### 機能2: PPT 生成

テーマや説明を一文で指定すると、PPT を自動作成します。処理はクラウドで実行され、完了後に**オンライン文書リンク**が返り、ブラウザで開いて確認・編集できます。

- **ターミナル**: `felo slides "テーマや説明"`
- **例**: `felo slides "Felo 製品紹介、3枚"`、`felo slides "Introduction to React" --poll-timeout 300`

---

## インストールと設定

### CLI のインストール

```bash
npm install -g felo-ai
```

インストールせずに実行: `npx felo-ai search "東京の天気"`  
インストール後のコマンドは `felo` です。

### API キー設定

推奨（永続保存）:

```bash
felo config set FELO_API_KEY your-api-key-here
```

または環境変数: `export FELO_API_KEY="your-api-key-here"`（Linux/macOS）、`$env:FELO_API_KEY="your-api-key-here"`（Windows PowerShell）。

API キーは [felo.ai](https://felo.ai)（設定 → API Keys）で取得してください。

### コマンド一覧

| コマンド | 説明 |
|----------|------|
| `felo search "<query>"` | リアルタイム検索 |
| `felo slides "<prompt>"` | PPT 生成 |
| `felo config set FELO_API_KEY <key>` | API キー保存 |
| `felo config get/list/path/unset` | 設定の参照/一覧/パス/削除 |

---

## Claude Code スキル

スキルのインストール:

```bash
npx @claude/skills add felo-ai
```

`FELO_API_KEY` を設定後、「東京の今日の天気」「React 19 の新機能」などの質問で検索が自動発動します。PPT 生成は現状ターミナルの `felo slides` のみ対応です。

---

## リンク

- [Felo オープンプラットフォーム](https://openapi.felo.ai/docs/) — API キー取得
- [API ドキュメント](https://openapi.felo.ai/docs/api-reference/v2/chat.html)
- [その他の例](./docs/EXAMPLES.md) | [FAQ](./docs/FAQ.md) | [GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues)

---

**他の言語 / Other languages:** [简体中文](README.zh-CN.md) | [English](README.en.md) | [한국어](README.ko.md) | [繁體中文](README.zh-TW.md)
