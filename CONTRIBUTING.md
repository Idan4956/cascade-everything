# Contributing to Cascade

Thank you for wanting to contribute! Whether it's a bug fix, a new feature, or a typo — every contribution matters.

## Getting started

### 1. Fork & clone

```bash
git clone https://github.com/YOUR_USERNAME/cascade-explorer.git
cd cascade-explorer
npm install
```

### 2. Run in development mode

```bash
npm run dev
```

This starts Electron with Vite hot-reload. Changes to React components update instantly; changes to `electron/main.js` or `electron/preload.js` require a full restart.

### 3. Project layout

```
cascade-explorer/
├── electron/
│   ├── main.js        # Main process (IPC handlers, window management)
│   └── preload.js     # Context bridge — exposes safe APIs to renderer
├── src/
│   ├── components/    # React UI components
│   ├── contexts/      # React context providers (ThemeContext, etc.)
│   ├── hooks/         # Custom hooks (useDirectory, etc.)
│   └── App.jsx        # Root component
├── docs/              # GitHub Pages website
└── resources/         # App icon
```

## Making changes

- **Bug fix**: Open an issue first if the fix is non-trivial — it helps avoid duplicate work.
- **New feature**: Open a feature-request issue to discuss scope before investing time.
- **Small improvement / typo**: Go ahead and open a PR directly.

### Commit style

Use clear imperative sentences:

```
feat: add keyboard shortcut for tag assignment
fix: prevent crash when opening empty directory
docs: update install instructions for macOS
```

## Opening a pull request

1. Push your branch to your fork
2. Open a PR against `main`
3. Fill in the PR template — what changed and why
4. One of the maintainers will review and merge

## Code style

- React functional components with hooks (no class components)
- Inline styles are fine for small one-off adjustments; prefer component-level CSS-in-JS or style objects for anything reused
- No TypeScript at the moment — plain JSX

## Reporting bugs / requesting features

Use the [issue templates](https://github.com/Idan4956/cascade-explorer/issues/new/choose) — they make it much easier to triage.

## License

By contributing you agree your changes will be licensed under the [MIT License](LICENSE).
