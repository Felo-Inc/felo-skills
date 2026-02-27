# Felo Search Skill for Claude Code

一個整合 [Felo Open Platform](https://felo.ai) 的 Claude Code skill，可執行智慧網路搜尋並提供 AI 生成的答案與來源引用。

## 功能特色

- 🔍 由 Felo AI 驅動的即時網路搜尋
- 🤖 AI 生成的完整答案
- 📚 附帶連結和摘要的來源引用
- 🔄 查詢分析與最佳化
- 🌐 多語言支援（自動匹配查詢語言）

## 安裝方式

1. 將 `felo-search` 資料夾複製到您的 Claude Code skills 目錄：
   - **Linux/macOS:** `~/.claude/skills/`
   - **Windows:** `C:\Users\<您的使用者名稱>\.claude\skills\`

2. 取得您的 Felo API Key：
   - 造訪 [felo.ai](https://felo.ai) 並登入
   - 前往設定 → API Keys
   - 建立新的 API 金鑰

3. 將 API 金鑰設定為環境變數：

   **Linux/macOS:**
   ```bash
   export FELO_API_KEY="your-api-key-here"
   # 加入 ~/.bashrc 或 ~/.zshrc 以永久保存
   ```

   **Windows (PowerShell):**
   ```powershell
   $env:FELO_API_KEY="your-api-key-here"
   # 若要永久保存，請加入系統環境變數
   ```

4. 重新啟動 Claude Code

## 使用方式

使用以下任一語句觸發此 skill：

- "用 Felo 搜尋..."（繁體中文）
- "Felo search for..."（英文）
- "使用 Felo 查詢..."（繁體中文）
- `/felo-search`（指令）

### 範例

```
使用者：用 Felo 搜尋量子計算的最新進展
使用者：Felo search for the latest AI trends in 2026
使用者：/felo-search What are the best restaurants in Tokyo?
```

## 回應格式

此 skill 會回傳：

1. **答案** - AI 生成的完整答案
2. **查詢分析** - 使用的最佳化搜尋查詢
3. **來源** - 附帶連結和摘要的網路來源清單

## 系統需求

- Claude Code CLI
- Felo API Key（提供免費方案）
- 網際網路連線

## 疑難排解

### "FELO_API_KEY environment variable is not set"

請確認您已設定環境變數並重新啟動 Claude Code。

### "INVALID_API_KEY"

您的 API 金鑰可能不正確或已被撤銷。請從 [felo.ai](https://felo.ai) 產生新的金鑰。

### 中文字元無法正常運作

此 skill 會自動使用 JSON 檔案處理中文字元。如果仍遇到問題，請確認您的終端機支援 UTF-8 編碼。

## 貢獻

歡迎貢獻！請隨時提交 issues 或 pull requests。

## 授權

MIT License - 歡迎自由使用和修改。

## 相關連結

- [Felo Open Platform](https://felo.ai)
- [API 文件](https://openapi.felo.ai)
- [Claude Code](https://claude.ai/code)
