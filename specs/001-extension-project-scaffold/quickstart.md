# Quickstart: Extension Scaffold

**Branch**: `001-extension-scaffold` | **Date**: 2026-04-15

## Prerequisites

- Node.js LTS (18+)
- VS Code 1.80+
- Git

## Setup

```bash
npm install
```

## Build

```bash
npm run compile       # single build, outputs to dist/
npm run watch         # rebuild on file change (development)
npm run package       # minified build (same as vscode:prepublish)
```

## Run Tests

```bash
npm test              # runs Vitest, enforces 100% coverage, exits non-zero on failure
```

Coverage report locations after `npm test`:

- **Plain text**: printed to terminal
- **HTML**: `coverage/index.html` — open in browser

## Run in VS Code

1. Open this repository in VS Code.
2. Press `F5` (or **Run > Start Debugging**) — launches the Extension Development Host.
3. In the Extension Development Host window, open any `.md` file.
4. The Visual Markdown webview should activate (if `visualMarkdown.defaultEditor` is
   `"webview"`, which is the default).
5. Check the **Output** panel (`View > Output`, select "Visual Markdown") for any errors.

## Toggle Raw Mode

With a `.md` file open in the webview, click the **"Edit Raw"** button in the webview
toolbar. The file reopens in VS Code's built-in text editor.

## Change the Default Editor Setting

Open VS Code settings (`Ctrl+,`), search for `Visual Markdown`, and change
`visualMarkdown.defaultEditor` to `"textEditor"`. The next `.md` file you open will
use the built-in text editor instead of the webview.

## Verify Coverage Gate

To verify the 100% gate is enforced:

```bash
# Temporarily comment out a line in src/settings.ts, then run:
npm test
# Expect: non-zero exit, coverage failure reported in terminal
```

Restore the line and rerun — expect exit code 0.
