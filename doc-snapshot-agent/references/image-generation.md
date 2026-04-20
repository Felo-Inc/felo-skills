# Image Generation Reference

Use this reference when the document needs conceptual visuals, diagrams, editorial illustrations, or any non-screenshot image.

This is a reference document for `doc-snapshot-agent`, not a standalone skill.

## Purpose

Generated images fill the gaps where a screenshot is impossible or inappropriate.

Typical cases:
- article hero images
- conceptual diagrams
- editorial illustrations
- workflow visuals
- product abstractions that do not correspond to a single literal screen

## Provider Assumption

This package includes a Python helper script that targets OpenRouter image-capable Gemini models.

Required environment variable:

```bash
OPENROUTER_API_KEY
```

Python dependency:

```bash
pip install requests
```

Never ask users to paste API keys into chat or hardcode them into files.

## Bundled Script

Use the included script:

```bash
python scripts/generate_image.py "A watercolor painting of a cat" -o output.png
```

Choose a model explicitly if needed:

```bash
python scripts/generate_image.py "Technical hero illustration" -o hero.png -m google/gemini-3-pro-image-preview
```

## Recommended Models

| Model ID | Best For |
|----------|----------|
| `google/gemini-3.1-flash-image-preview` | default fast generation |
| `google/gemini-3-pro-image-preview` | stronger instruction following and better text rendering |

Use the pro model when the image needs readable labels, UI-like text, or tighter compliance with detailed instructions.

## Prompt Construction

A good prompt should include:
- subject
- purpose in the document
- style direction
- any required text in the image
- constraints such as aspect ratio, palette, or things to avoid

Template:

```text
Goal: cover image for a technical article about collaborative AI workflows
Subject: multiple browser windows, markdown files, screenshots, and organized folders
Style: clean editorial illustration, modern flat design, soft shadows, warm neutral palette
Text: none
Constraints: landscape composition, no watermarks, avoid photorealistic faces
```

## Prompting Tips

- be specific about what the image is for
- avoid overloading the prompt with too many unrelated ideas
- specify text explicitly if the image needs words on it
- mention composition and aspect ratio when layout matters
- if the article has an established visual tone, keep the generated image consistent with it

## Generation Workflow

### 1. Extract the Description

Use the description from the image marker or summary table.

### 2. Expand It Into a Real Prompt

Turn terse notes into an explicit image brief.

Weak:
- `AI workflow`

Better:
- `Editorial illustration for a technical blog post showing an AI-assisted coding workflow with a browser, Markdown files, screenshots, and a tidy project folder structure. Flat vector style, warm neutrals, subtle depth, no logos, no text.`

### 3. Run the Generator

```bash
python scripts/generate_image.py "{prompt}" -o "output/{article-id}/{filename}"
```

### 4. Review the Result

Check whether:
- the main idea is visible
- the style fits the article
- any required text is legible
- the image is usable at article scale

If the result is weak, refine the prompt and retry.

## Failure Handling

If generation fails:
- keep the workflow running
- note the failure in the article README
- insert a warning block in the output Markdown

Suggested warning block:

```markdown
> Warning: AI image generation failed for hero.png - timeout from provider
```

## Security and Privacy

What leaves the machine:
- prompt text sent to the provider endpoint

What stays local:
- API key in the environment
- generated image files written to disk

This workflow should not:
- hardcode secrets
- store user API keys in repository files
- upload output images anywhere unless the user explicitly asks
