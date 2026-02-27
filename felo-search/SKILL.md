---
name: felo-search
description: 使用 Felo AI 執行智慧網路搜尋，取得 AI 生成的答案與來源引用
---

# Felo Search Skill

此 skill 整合 Felo Open Platform 的 Chat API，執行智慧網路搜尋並取得附帶來源引用的 AI 生成答案。

## 設定

### 1. 取得您的 API Key

1. 造訪 [felo.ai](https://felo.ai) 並登入（或註冊）
2. 點擊右上角的頭像 → 設定
3. 前往「API Keys」分頁
4. 點擊「Create New Key」以產生新的 API Key
5. 複製並安全地儲存您的 API Key

### 2. 設定 API Key

設定 `FELO_API_KEY` 環境變數：

**Linux/macOS:**
```bash
export FELO_API_KEY="your-api-key-here"
```

**Windows (PowerShell):**
```powershell
$env:FELO_API_KEY="your-api-key-here"
```

**Windows (CMD):**
```cmd
set FELO_API_KEY=your-api-key-here
```

若要永久設定，請將其加入您的 shell profile（~/.bashrc、~/.zshrc）或系統環境變數。

## 使用時機

當使用者需要以下功能時使用此 skill：
- 附帶 AI 生成完整答案的即時網路搜尋
- 需要網路上最新/近期資料的資訊
- 附帶來源引用和參考資料的答案
- 查詢分析與最佳化以獲得更好的搜尋結果

觸發語句：
- "用 Felo 搜尋..."
- "Felo search for..."
- "使用 Felo 查詢..."
- "/felo-search"

## API 設定

**端點：** `https://openapi.felo.ai/v2/chat`

**驗證：** Authorization header 中的 Bearer token（來自 `FELO_API_KEY` 環境變數）

## 使用方式

當被呼叫時，此 skill 將會：

1. 檢查 `FELO_API_KEY` 環境變數是否已設定
2. 接受使用者的搜尋查詢
3. 使用查詢呼叫 Felo Chat API
4. 回傳格式化的回應，包含：
   - AI 生成的完整答案
   - 查詢分析（最佳化的搜尋查詢）
   - 附帶連結、標題和摘要的來源引用

## 實作方式

### 步驟 1：檢查 API Key

首先，驗證 API 金鑰是否已設定：

```bash
if [ -z "$FELO_API_KEY" ]; then
  echo "Error: FELO_API_KEY 環境變數未設定"
  echo "請依照設定說明配置您的 API 金鑰"
  exit 1
fi
```

如果 API 金鑰未設定，請向使用者提供清楚的設定說明。

### 步驟 2：發送 API 請求

建立包含查詢的臨時 JSON 檔案（以處理特殊字元和編碼）：

```bash
# Create query JSON file
echo '{"query": "USER_QUERY_HERE"}' > /tmp/felo_query.json

# Make API request
curl -X POST https://openapi.felo.ai/v2/chat \
  -H "Authorization: Bearer $FELO_API_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/felo_query.json

# Clean up
rm /tmp/felo_query.json
```

**注意：** 使用 JSON 檔案而非內嵌 JSON 有助於正確處理中文字元和特殊字元。

## 回應格式

以此格式向使用者呈現結果：

```
## 答案
[AI 生成的答案]

## 查詢分析
最佳化查詢：[查詢清單]

## 來源
1. [標題](連結)
   摘要：[摘要文字]
2. [標題](連結)
   摘要：[摘要文字]
...
```

## 錯誤處理

### 常見錯誤代碼

- `INVALID_API_KEY` - API Key 無效或已被撤銷
  - 解決方案：檢查您的 API 金鑰是否正確且未被撤銷
- `MISSING_PARAMETER` - 缺少必要參數
  - 解決方案：確保已提供查詢參數
- `INVALID_PARAMETER` - 參數值無效
  - 解決方案：檢查查詢格式
- `CHAT_FAILED` - 內部服務錯誤
  - 解決方案：重試請求或聯絡 Felo 支援

### API Key 未設定

如果 `FELO_API_KEY` 未設定，顯示此訊息：

```
❌ Felo API Key 未設定

要使用此 skill，您需要設定 Felo API Key：

1. 從 https://felo.ai 取得您的 API 金鑰（設定 → API Keys）
2. 設定環境變數：

   Linux/macOS:
   export FELO_API_KEY="your-api-key-here"

   Windows (PowerShell):
   $env:FELO_API_KEY="your-api-key-here"

3. 重新啟動 Claude Code 或重新載入環境
```

## 範例

**使用者：** "用 Felo 搜尋人工智慧的最新發展"

**動作：** 使用查詢「人工智慧的最新發展」呼叫 Felo API，並格式化回應包含答案、查詢分析和來源。

**使用者：** "Felo search for the latest developments in quantum computing"

**動作：** 使用英文查詢呼叫 Felo API 並呈現格式化結果。

## 注意事項

- API 金鑰從 `FELO_API_KEY` 環境變數讀取以確保安全性
- API 會盡可能以查詢語言回傳結果
- 包含所有來源引用以提供使用者資訊透明度
- 保持回應簡潔但完整
- 使用 JSON 檔案處理查詢以正確處理特殊字元和編碼

## 其他資源

- [Felo Open Platform 文件](https://openapi.felo.ai)
- [取得 API Key](https://felo.ai)（設定 → API Keys）
- [API 參考文件](https://openapi.felo.ai/docs)
