# PromptLens 🔮

> Upload, Create, Inspire — turn any photo into the perfect AI prompt, or generate a brand new image from a photo + prompt. 100% front-end, no backend required.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## ✨ Overview

PromptLens is a vanilla **HTML / CSS / JavaScript** web app with two core AI-style tools:

1. **Photo → Prompt** — Upload any image and get a detailed, ready-to-use prompt (with Midjourney / Stable Diffusion formatting options) describing it.
2. **Prompt → Image** — Upload a photo (optional) and a text prompt, and generate a brand new stylized image right in the browser.

Everything runs client-side — no server, no API keys, no build step. Just open `index.html` and go.

## 🖼️ Preview

| Home | Photo → Prompt | Prompt → Image |
|------|------------------|------------------|
| Hero + how-it-works + features | Drag & drop, style/format options | Optional photo upload, advanced settings |

## 🚀 Features

- 🎯 **Photo → Prompt generator** — analyzes the uploaded image (dominant color, brightness, orientation) and writes a tailored prompt in Detailed / Short / Midjourney / Stable Diffusion formats, with selectable style presets.
- 🎨 **Prompt → Image generator** — drag-and-drop upload **(optional)**, aspect ratio chips, style selector, quality slider, and toggles (Enhance Details, Preserve Composition, Remove Background). If no photo is uploaded, an abstract artwork is generated purely from the text prompt using a deterministic hash-based color/composition algorithm.
- 🕘 **History page** — every generation is saved to `localStorage` with thumbnail, type, style, and timestamp; supports delete and clear-all.
- 💳 **Pricing page** — simple 3-tier plan layout (front-end only, no payment integration).
- 📋 **Copy / Download** — copy prompts to clipboard or download as `.txt`; download generated images as `.jpg`.
- 📬 **Contact modal** — quick links to LinkedIn, GitHub, Email, and Mobile.
- 🔔 **Toast notifications** — for copy actions, downloads, "coming soon" features, and form submissions.
- 📱 **Fully responsive** — mobile hamburger nav, stacked grids, touch-friendly controls.

## 🗂️ Project Structure

```
promptlens/
├── index.html              # Home page (hero, how it works, features, about)
├── photo-to-prompt.html    # Upload Photo → Get Prompt tool
├── prompt-to-image.html    # Upload Photo + Prompt → Generate Image tool
├── history.html            # Local generation history
├── pricing.html            # Pricing plans
├── styles.css              # All styling (design tokens, components, responsive rules)
├── script.js               # All interactivity (uploads, generation logic, history, modals, toasts)
└── README.md
```

## 🛠️ Tech Stack

- **HTML5** — semantic markup across 5 pages
- **CSS3** — custom design system using CSS variables, no framework
- **Vanilla JavaScript (ES6+)** — no libraries, no build tools
- **Font Awesome** (CDN) — icons
- **Google Fonts** (Fraunces + Manrope) — typography

No npm, no bundler, no dependencies to install.

## ▶️ Getting Started

### Option 1 — Just open it
Clone the repo and open `index.html` directly in your browser.

```bash
git clone https://github.com/anurag2882/promptlens.git
cd promptlens
open index.html      # macOS
# or double-click index.html on Windows/Linux
```

### Option 2 — Local server (recommended for clipboard/file APIs to behave consistently)
```bash
# Python
python3 -m http.server 5500

# or Node
npx serve .
```
Then visit `http://localhost:5500`.

## 🧠 How the "AI" works (no real model attached)

Since this is a pure front-end project, the generation logic is **simulated** but still reacts to real input:

- **Photo → Prompt**: samples pixel data from the uploaded image via `<canvas>` to detect dominant color, brightness, and orientation, then builds a templated prompt that reflects those traits and your selected style/format.
- **Prompt → Image**: if a photo is uploaded, it's re-rendered through CSS canvas filters matched to the chosen style. If no photo is uploaded, an abstract gradient/blob composition is generated using a deterministic hash of your prompt text — same prompt always produces the same look.

To plug in a real model, the integration points are:
- `buildPrompt()` in `script.js` (Photo → Prompt)
- the `generateBtn` click handler in the Prompt → Image section of `script.js`

## 📌 Roadmap / Known Limitations

- [ ] Real AI integration (currently simulated client-side)
- [ ] Privacy Policy / Terms of Use pages (currently show a "coming soon" toast)
- [ ] Dedicated AI Generator tool (currently shows a "coming soon" toast)
- [ ] Pricing plans are display-only, no real checkout

## 📄 License

This project is open for personal and educational use. Feel free to fork and adapt.

## 📬 Contact

- LinkedIn: [linkedin.com/in/anuragmishra27](https://www.linkedin.com/in/anuragmishra27)
- GitHub: [github.com/anurag2882](https://github.com/anurag2882)
- Email: anuragmishra.5347@gmail.com
- Mobile: +91 8810703682