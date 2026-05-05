# DeepRead

**AI-native document processing API — extract structured data from any PDF or image with 97%+ accuracy.**

DeepRead uses multi-model consensus (GPT + Gemini + dual OCR) to extract text, fill forms, and redact PII from documents. It flags uncertain fields for human review instead of guessing.

---

## What It Does

- **OCR & Text Extraction** — Convert any PDF or image to clean text
- **Structured Data Extraction** — Pull typed JSON fields with confidence scores from invoices, contracts, medical records
- **PDF Form Filling** — Fill blank PDF forms with AI vision (works on scanned, non-editable forms)
- **PII Redaction** — Detect and redact 14 types of PII with irreversible black bars (HIPAA/GDPR ready)

**When to use:**
- Invoice and receipt processing
- Medical records, lab reports, prescriptions (with HIPAA-compliant PII redaction)
- Legal contracts, NDAs, leases
- Insurance claims and policy documents
- Form filling (W-4, I-9, government forms)
- Any document → structured data pipeline

**When NOT to use:**
- Generating new documents from scratch
- Image generation or editing
- Text translation

---

## Quick Setup

### Step 1: Get a free API key

Visit [deepread.tech/dashboard](https://www.deepread.tech/dashboard) — 2,000 pages/month free, no credit card required.

### Step 2: Set the environment variable

```bash
export DEEPREAD_API_KEY="sk_live_your_key_here"
```

### Step 3: Test it

Ask Claude:
> "Extract the vendor and total from this invoice.pdf"

---

## Usage Examples

**Extract structured data:**
> "Pull the vendor, total, and due date from invoice.pdf"

**Redact PII:**
> "Remove all personal information from patient_record.pdf"

**Fill a form:**
> "Fill out this W-4 with my info: name=Jane Smith, SSN=123-45-6789, address=123 Main St"

**OCR a scan:**
> "Extract all text from scan.png"

---

## Pricing

- **Free**: 2,000 pages/month, 15MB file limit
- **Pro**: $99/mo for 50,000 pages, 50MB file limit
- **BYOK**: Connect your own OpenAI/Google API key at [dashboard/byok](https://www.deepread.tech/dashboard/byok) — zero DeepRead costs, page quota skipped entirely

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| 401 Unauthorized | Check `DEEPREAD_API_KEY` is set correctly |
| 413 File too large | Free tier max is 15MB, upgrade or split file |
| 429 Rate limit | Use BYOK to skip quotas |
| Timeout (5 min) | Document is very large, try splitting |

---

## Links

- [Website](https://www.deepread.tech)
- [Dashboard](https://www.deepread.tech/dashboard)
- [Demo Repo with examples](https://github.com/deepread-tech/deepread-demo)
- [Report issues](https://github.com/deepread-tech/skills/issues)
- Email: hello@deepread.tech
