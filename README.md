<div align="center">

<img src="resources/icon.png" width="80" height="80" alt="Cascade icon" />

# Cascade

**A fast, beautiful file explorer — built for power users.**

[![Release](https://img.shields.io/github/v/release/Idan4956/cascade-explorer?style=flat-square&color=8b5cf6&label=latest)](https://github.com/Idan4956/cascade-explorer/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/Idan4956/cascade-explorer/total?style=flat-square&color=6366f1&label=downloads)](https://github.com/Idan4956/cascade-explorer/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-333?style=flat-square)](https://github.com/Idan4956/cascade-explorer/releases/latest)

[**Download**](#-download) · [Website](https://idan4956.github.io/cascade-explorer/) · [Report a bug](https://github.com/Idan4956/cascade-explorer/issues/new?template=bug_report.yml) · [Request a feature](https://github.com/Idan4956/cascade-explorer/issues/new?template=feature_request.yml)

</div>

---

Cascade replaces your OS file manager with a column-based browser that shows your entire folder hierarchy at once. Navigate deep trees instantly, preview any file in place, tag files with colour-coded labels, and search your whole system in seconds — all in a beautifully designed, frameless window.

## ✨ Features

| | |
|---|---|
| 📂 **Column browsing** | Navigate nested folders side-by-side with smooth horizontal scrolling |
| 🏷️ **Custom tags** | Create colour-coded tags and filter your entire filesystem by them |
| ⚡ **Instant search** | Full-filesystem recursive search with fuzzy/typo-tolerant matching |
| 🗂️ **Smart folders** | Built-in views for Recent, All Images, Large Files, Screenshots & Documents |
| 👁️ **Rich previews** | Images, video, audio waveforms, text, code, PDFs — no separate app needed |
| 🎨 **Glassmorphic UI** | Custom frameless window with smooth animations and accent colour themes |
| 🤖 **AI search** | Smart natural-language search powered by Claude (optional, bring your own key) |
| 📦 **Archive browsing** | Browse ZIP and 7z archives in-place without extracting |
| 🪟 **Shell integration** | Windows context-menu "Open in Cascade" support |

## 📥 Download

> **Free forever. No sign-up, no telemetry, no subscription.**

### Direct download

| Platform | File | Notes |
|---|---|---|
| 🪟 Windows | [Cascade-Setup.exe](https://github.com/Idan4956/cascade-explorer/releases/latest/download/Cascade-Setup.exe) | NSIS installer, 64-bit |
| 🪟 Windows Store | [Cascade.appx](https://github.com/Idan4956/cascade-explorer/releases/latest/download/Cascade.appx) | MSIX package |
| 🍎 macOS | [Cascade-mac.dmg](https://github.com/Idan4956/cascade-explorer/releases/latest/download/Cascade-mac.dmg) | Universal DMG |
| 🐧 Linux | [Cascade-linux.AppImage](https://github.com/Idan4956/cascade-explorer/releases/latest/download/Cascade-linux.AppImage) | AppImage, no install needed |

### Package managers

**Windows — Scoop**
```powershell
scoop bucket add cascade-explorer https://github.com/Idan4956/cascade-explorer
scoop install cascade
```

**Windows — winget** *(pending approval)*
```powershell
winget install Idan4956.Cascade
```

**macOS — Homebrew** *(coming soon)*
```bash
brew install --cask cascade-explorer
```

**Linux — AppImage (manual)**
```bash
chmod +x Cascade-linux.AppImage
./Cascade-linux.AppImage
```

## 🔨 Build from source

Prerequisites: **Node.js 20+**, **Git**

```bash
git clone https://github.com/Idan4956/cascade-explorer.git
cd cascade-explorer
npm install

# Development (hot-reload)
npm run dev

# Production build
npm run package
```

Installers land in the `release/` directory.

### Environment variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Enables AI-powered search (optional) |

## 🤝 Contributing

Contributions of any size are welcome — bug fixes, new features, documentation improvements, or just a typo fix.

1. [Fork the repository](https://github.com/Idan4956/cascade-explorer/fork)
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit your changes
4. Open a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📬 Contact

Questions, bug reports, feature requests → [open an issue](https://github.com/Idan4956/cascade-explorer/issues) or email [cascadefileexplorer@gmail.com](mailto:cascadefileexplorer@gmail.com).

## 📄 License

MIT © [Idan4956](https://github.com/Idan4956) — free to use, fork, and build on.

---

<div align="center">
  <sub>If Cascade saves you time, a ⭐ on GitHub goes a long way!</sub>
</div>
