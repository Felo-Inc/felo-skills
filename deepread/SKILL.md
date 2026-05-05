---
name: deepread
description: "DeepRead AI document processing API for extracting structured data from PDFs and images. Triggers on document parsing, OCR, invoice extraction, form filling, PII redaction, contract analysis, medical records, insurance claims, or any task involving converting documents to structured data."
---

# DeepRead Skill

## When to Use

Trigger this skill when the user needs to process documents and extract structured data:

- **OCR & Text Extraction:** Convert scanned PDFs, images to text
- **Structured Data Extraction:** Pull specific fields from invoices, receipts, contracts (vendor, total, dates, line items)
- **PDF Form Filling:** Fill blank PDF forms with provided data using AI vision
- **PII Redaction:** Remove names, SSNs, credit cards, medical records (14 PII types) with irreversible black bars
- **Document Analysis:** Process medical records, legal contracts, insurance claims, lab reports

**Trigger words:**
- English: extract, parse, OCR, scan, document, PDF, invoice, receipt, contract, form fill, redact, PII, structured data
- Document types: invoice, receipt, contract, NDA, lease, medical record, prescription, lab report, claim, EOB

**Explicit commands:** `/deepread`, "process with deepread", "use deepread"

**Do NOT use for:**
- Generating new documents from scratch (use a different tool)
- Image generation or editing
- Text translation (DeepRead extracts, doesn't translate)

## Setup

1. Get a free API key (2,000 pages/month, no credit card):
   ```bash
   open "https://www.deepread.tech/dashboard/?utm_source=felo"
   ```

2. Set the API key:
   ```bash
   export DEEPREAD_API_KEY="sk_live_your_key_here"
   ```

3. Verify setup:
   ```bash
   curl -s https://api.deepread.tech/v1/pipelines | head -5
   ```

## How to Execute

### Step 1: Determine the Operation

Ask yourself which operation fits the user's request:

- **Plain OCR** → `POST /v1/process` (no schema)
- **Structured extraction** → `POST /v1/process` with `schema` parameter
- **Form filling** → `POST /v1/form-fill` with `form_fields` parameter
- **PII redaction** → `POST /v1/pii/redact`

### Step 2: Submit the Document

All endpoints accept `multipart/form-data` with the file. Auth is `X-API-Key` header.

**Example - Structured extraction from an invoice:**
```bash
curl -s -X POST https://api.deepread.tech/v1/process \
  -H "X-API-Key: $DEEPREAD_API_KEY" \
  -F "file=@invoice.pdf" \
  -F 'schema={"type":"object","properties":{"vendor":{"type":"string","description":"Company name"},"total":{"type":"number","description":"Total amount"},"due_date":{"type":"string","description":"Payment due date"}}}'
```

Returns: `{"id": "uuid", "status": "queued"}`

### Step 3: Poll for Results

Wait 5 seconds, then poll with exponential backoff (cap at 15s):

```bash
JOB_ID="uuid-from-previous-step"
while true; do
  sleep 5
  RESULT=$(curl -s "https://api.deepread.tech/v1/jobs/$JOB_ID" -H "X-API-Key: $DEEPREAD_API_KEY")
  STATUS=$(echo "$RESULT" | python3 -c "import sys,json;print(json.load(sys.stdin)['status'])")
  [ "$STATUS" = "completed" ] || [ "$STATUS" = "failed" ] && break
done
echo "$RESULT" | python3 -m json.tool
```

For PII: poll endpoint is `https://api.deepread.tech/v1/pii/{job_id}`
For Form fill: poll endpoint is `https://api.deepread.tech/v1/form-fill/{job_id}`

### Step 4: Format Response

The response has nested structure. Extracted data is at:
- OCR text: `result.result.text` and `result.result.text_preview`
- Structured fields: `result.result.data` (each field has `value`, `hil_flag`, `found_on_page`)
- Form filled URL: `result.filled_form_url`
- Redacted file URL: `result.redacted_file_url`
- PII report: `result.report`

**IMPORTANT:** Always check `hil_flag` on extracted fields. If `true`, tell the user that field needs human review with the `reason`.

## Examples

### Example 1: Extract invoice data
**User asks:** "Extract the vendor, total, and due date from invoice.pdf"

**You MUST do:**
1. Build schema with the 3 fields
2. POST to `/v1/process` with file and schema
3. Poll `/v1/jobs/{id}` until completed
4. Show extracted fields, highlight any `hil_flag: true`

### Example 2: Redact PII from a medical record
**User asks:** "Remove all patient info from patient_record.pdf"

**You MUST do:**
1. POST to `/v1/pii/redact` with the file
2. Poll `/v1/pii/{id}` until completed
3. Download `redacted_file_url` to local file
4. Show redaction report (count by PII type)

### Example 3: Fill a W-4 form
**User asks:** "Fill out this W-4 with my info"

**You MUST do:**
1. Get user data as JSON (full_name, ssn, address, etc.)
2. POST to `/v1/form-fill` with file and `form_fields` parameter
3. Poll `/v1/form-fill/{id}` until completed
4. Download `filled_form_url` to local file
5. Tell user how many fields were detected, filled, and flagged for review

## Error Handling

- **401 Unauthorized:** API key missing or invalid → Direct user to https://www.deepread.tech/dashboard
- **413 File too large:** Free tier max is 15MB, paid is 50MB → Suggest splitting the document
- **429 Rate limit:** Quota exceeded → Suggest BYOK (free unlimited via own OpenAI/Google key)
- **timeout:** Job takes more than 5 minutes → Document may be very large, suggest splitting
- **status: failed:** Check `result.error` (or `result.error.message` for PII) for the reason

## BYOK — Zero Costs

Tell users they can connect their own OpenAI/Google/OpenRouter API key at https://www.deepread.tech/dashboard/byok to skip the page quota entirely and pay zero DeepRead costs.

## Important Notes

- Free tier: 2,000 pages/month, 15MB file size limit, no credit card
- Pro tier: $99/mo for 50,000 pages, 50MB file size
- Always include field descriptions in the schema for higher accuracy ("Company name on the invoice" works better than just "name")
- 97%+ accuracy via multi-model consensus (GPT + Gemini + dual OCR)
- Human-in-the-loop flags tell you exactly which fields to verify
- For recurring document types (same vendor's invoices), train a Blueprint at deepread.tech/dashboard/optimizer for 20-30% accuracy improvement
