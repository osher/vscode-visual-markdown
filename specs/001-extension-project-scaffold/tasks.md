---
description: "Task list for Extension Scaffold feature"
---

# Tasks: Extension Scaffold

**Input**: Design documents from `specs/001-extension-project-scaffold/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ quickstart.md ✅

**TDD**: Constitution Principle III is NON-NEGOTIABLE. All test tasks must be written
FIRST and confirmed failing before their corresponding implementation tasks begin.

## Format: `[ID] [P?] [SYNC/ASYNC] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[SYNC]**: Requires human review — architectural, complex, or quality-gate critical
- **[ASYNC]**: Delegate to agent — boilerplate, well-specified, no judgment calls
- **[Story]**: Maps to user story (US1–US4)

---

## Phase 1: Setup

**Purpose**: Project skeleton and build tooling. No source logic yet.

- [ ] T001 [SYNC] Create `package.json` with VS Code extension manifest:
  `name`, `displayName`, `publisher`, `engines.vscode ^1.80.0`, `main ./dist/extension.js`,
  `contributes.customEditors` (`viewType: visualMarkdown.editor`, `priority: option`,
  selector `*.md`), `contributes.configuration` (`visualMarkdown.defaultEditor` enum),
  `activationEvents`, `scripts` (compile/watch/package/test/vscode:prepublish)
- [ ] T002 [P] [ASYNC] Create `tsconfig.json` with strict mode, `module: commonjs`,
  `target: ES2020`, `outDir: dist`, `rootDir: src`, `sourceMap: true`
- [ ] T003 [P] [ASYNC] Create `esbuild.js`: entry `src/extension.ts`,
  outfile `dist/extension.js`, external `vscode`, format `cjs`, platform `node`,
  sourcemap, watch/minify flags via `process.argv`
- [ ] T004 [P] [ASYNC] Create `.vscodeignore` excluding `src/`, `tests/`, `__mocks__/`,
  `coverage/`, `*.ts`, `esbuild.js`, `vitest.config.ts`, `.specify/`, `.claude/`
- [ ] T005 [P] [ASYNC] Create `.gitignore` excluding `dist/`, `coverage/`, `node_modules/`

---

## Phase 2: Foundational — Test Infrastructure (US4)

**Purpose**: Vitest wired with 100% coverage gate. Blocks ALL user story implementation.
This phase delivers User Story 4 (test infrastructure) as a side effect.

**⚠️ CRITICAL**: No user story implementation work can begin until this phase is complete.

**Goal (US4)**: `npm test` runs, enforces 100% coverage, produces plain + HTML reports.

- [ ] T006 [SYNC] [US4] Create `vitest.config.ts`:
  - `test.environment: node`
  - `coverage.provider: v8`
  - `coverage.reporter: ['text', 'html']`
  - `coverage.thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 }`
  - `coverage.include: ['src/**/*.ts']`
  - `resolve.alias: { vscode: path.resolve(__dirname, '__mocks__/vscode.ts') }`
  - Wire `npm test` script to `vitest run --coverage`
- [ ] T007 [SYNC] [US4] Create `__mocks__/vscode.ts` — hand-rolled Vitest mock for the
  `vscode` module. Must stub: `window`, `workspace.getConfiguration`, `commands.executeCommand`,
  `Uri`, `ExtensionContext`, `CustomTextEditorProvider`-related types, `WebviewPanel`,
  `Disposable`. Annotate with `as unknown as typeof import('vscode')` where needed.

**Checkpoint (US4)**: Run `npm test` — expect it to pass (no source files to cover yet,
thresholds only fail when coverage falls below 100% on covered files). Confirm HTML report
generates at `coverage/index.html`.

---

## Phase 3: User Story 1 — Open Markdown File in Webview (Priority: P1) 🎯 MVP

**Goal**: Opening a `.md` file activates the webview with a placeholder and a toggle button.

**Independent Test**: Open any `.md` file in the Extension Development Host — webview
panel appears, placeholder visible, no extension host log errors.

> **⚠️ TDD: Write and confirm FAILING tests before any implementation in this phase.**

### Tests for US1 (write first — must FAIL before implementation)

- [ ] T008 [P] [SYNC] [US1] Create `tests/VisualMarkdownEditorProvider.test.ts`:
  - Test: `resolveCustomTextEditor` sets `webviewPanel.webview.html` to non-empty string
  - Test: webview HTML contains a button with text "Edit Raw" (or data-action="open-raw")
  - Test: `webviewPanel.webview.options.enableScripts` is `true`
  - Confirm these tests FAIL (provider not yet implemented)
- [ ] T009 [P] [SYNC] [US1] Create `tests/extension.test.ts`:
  - Test: `activate()` registers a `CustomTextEditorProvider` via
    `vscode.window.registerCustomEditorProvider` with viewType `visualMarkdown.editor`
  - Test: `activate()` subscribes to `vscode.workspace.onDidOpenTextDocument`
  - Confirm these tests FAIL (extension.ts not yet implemented)

### Implementation for US1

- [ ] T010 [SYNC] [US1] Create `src/VisualMarkdownEditorProvider.ts`:
  Implements `vscode.CustomTextEditorProvider`. `resolveCustomTextEditor` sets
  `webviewPanel.webview.options = { enableScripts: true }` and
  `webviewPanel.webview.html = getWebviewContent()`. `getWebviewContent()` returns the
  placeholder HTML loaded from `src/webview/index.html` (or inlined). Registers
  `webviewPanel.webview.onDidReceiveMessage` (stub — handler added in US2).
- [ ] T011 [P] [ASYNC] [US1] Create `src/webview/index.html`:
  Static placeholder HTML. Must include: `<meta http-equiv="Content-Security-Policy">`
  header (allow `vscode-resource:` scripts, no inline styles from external origins),
  visible placeholder text, and a button with `data-action="open-raw"` that calls
  `acquireVsCodeApi().postMessage({ type: 'openRaw' })` on click.
- [ ] T012 [SYNC] [US1] Create `src/extension.ts`:
  `activate(context)` registers `VisualMarkdownEditorProvider` via
  `vscode.window.registerCustomEditorProvider('visualMarkdown.editor', provider, ...)`.
  Subscribes to `vscode.workspace.onDidOpenTextDocument` — routing logic stubbed
  (full routing added in US3). `deactivate()` exported as no-op.

**Checkpoint (US1)**: Run `npm test` — all T008/T009 tests must pass at 100% coverage.
Run `F5` in VS Code — open a `.md` file, confirm webview appears with placeholder and
"Edit Raw" button, no errors in Output panel.

---

## Phase 4: User Story 2 — Toggle to Raw Markdown View (Priority: P2)

**Goal**: Clicking "Edit Raw" in the webview reopens the file in the built-in text editor.

**Independent Test**: With webview open, click "Edit Raw" — file reopens in text editor.

> **⚠️ TDD: Add failing tests before implementing the message handler.**

### Tests for US2 (add to existing test file — must FAIL before implementation)

- [ ] T013 [SYNC] [US2] Add to `tests/VisualMarkdownEditorProvider.test.ts`:
  - Test: when `onDidReceiveMessage` receives `{ type: 'openRaw' }`, it calls
    `vscode.commands.executeCommand('vscode.openWith', document.uri, 'default')`
  - Confirm this test FAILS (handler not yet implemented)

### Implementation for US2

- [ ] T014 [SYNC] [US2] Implement `onDidReceiveMessage` handler in
  `src/VisualMarkdownEditorProvider.ts`: on `{ type: 'openRaw' }`, call
  `vscode.commands.executeCommand('vscode.openWith', document.uri, 'default')`.
  No other message types handled yet.

**Checkpoint (US2)**: Run `npm test` — T013 passes. Run in Extension Development Host —
click "Edit Raw", confirm file reopens in text editor.

---

## Phase 5: User Story 3 — Control Default Editor via Setting (Priority: P3)

**Goal**: `visualMarkdown.defaultEditor` setting controls whether `.md` files open in
the webview or the built-in text editor by default.

**Independent Test**: Set setting to `"textEditor"`, open a `.md` file — built-in text
editor opens. Set to `"webview"` — webview opens.

> **⚠️ TDD: Write failing tests before implementation.**

### Tests for US3 (write first — must FAIL before implementation)

- [ ] T015 [P] [SYNC] [US3] Create `tests/settings.test.ts`:
  - Test: `getDefaultEditor()` returns `"webview"` when config returns `"webview"`
  - Test: `getDefaultEditor()` returns `"textEditor"` when config returns `"textEditor"`
  - Test: `getDefaultEditor()` returns `"webview"` (fallback) when config returns
    an unrecognized value
  - Confirm these tests FAIL (settings.ts not yet implemented)
- [ ] T016 [P] [SYNC] [US3] Add to `tests/extension.test.ts`:
  - Test: when `onDidOpenTextDocument` fires for a `.md` file and setting is `"webview"`,
    `vscode.commands.executeCommand('vscode.openWith', doc.uri, 'visualMarkdown.editor')`
    is called
  - Test: when setting is `"textEditor"`, `executeCommand` is NOT called
  - Confirm these tests FAIL

### Implementation for US3

- [ ] T017 [ASYNC] [US3] Create `src/settings.ts`:
  Exports `getDefaultEditor(): 'webview' | 'textEditor'`. Reads
  `vscode.workspace.getConfiguration('visualMarkdown').get('defaultEditor')`.
  Returns `'webview'` as fallback for unrecognized values.
- [ ] T018 [SYNC] [US3] Implement `onDidOpenTextDocument` routing in `src/extension.ts`:
  For each `.md` document opened, call `getDefaultEditor()`. If `'webview'`, call
  `vscode.commands.executeCommand('vscode.openWith', doc.uri, 'visualMarkdown.editor')`.
  If `'textEditor'`, do nothing. Guard against non-`.md` files (`languageId !== 'markdown'`).

**Checkpoint (US3)**: Run `npm test` — all tests pass at 100% coverage. Verify both
setting values work in the Extension Development Host.

---

## Phase 6: Polish & Validation

**Purpose**: Final build verification and cross-cutting checks.

- [ ] T019 [SYNC] Run `npm run compile` — confirm zero TypeScript errors in strict mode.
  Fix any type errors surfaced by the build.
- [ ] T020 [SYNC] Run `npm test` — confirm 100% line/branch/function/statement coverage,
  exit code 0, HTML report at `coverage/index.html` is browsable and complete.
- [ ] T021 [ASYNC] Verify `.vscodeignore` excludes all non-distribution files.
  Run `npx vsce ls` to inspect the package manifest and confirm `dist/` and
  `package.json` are included; source, tests, and spec files are excluded.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — blocks all US phases
- **Phase 3 (US1)**: Depends on Phase 2
- **Phase 4 (US2)**: Depends on Phase 3 (extends VisualMarkdownEditorProvider)
- **Phase 5 (US3)**: Depends on Phase 2; can run in parallel with Phase 4
- **Phase 6 (Polish)**: Depends on all story phases

### Within Each Phase

- Tests MUST be written and confirmed FAILING before implementation (constitution III)
- Tests within a phase marked [P] can run in parallel (different files)
- `extension.ts` tasks are sequential (same file across US1 and US3)

### Parallel Opportunities

```bash
# Phase 1 — all [P] tasks can run together:
T002 tsconfig.json  &  T003 esbuild.js  &  T004 .vscodeignore  &  T005 .gitignore

# Phase 3 tests — parallel before implementation:
T008 VisualMarkdownEditorProvider.test.ts  &  T009 extension.test.ts

# Phase 5 tests — parallel before implementation:
T015 settings.test.ts  &  T016 extension.test.ts additions

# Phase 5 implementation (T017 settings.ts) can run parallel with T018 after T015 passes
```

---

## Implementation Strategy

### MVP (User Story 1 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (test infrastructure)
3. Complete Phase 3: US1 (webview opens)
4. **STOP and VALIDATE**: `npm test` passes, webview opens in Extension Development Host
5. US2 and US3 can be deferred

### Full Delivery

1. Phase 1 + 2 → test infrastructure ready
2. Phase 3 (US1) → MVP webview
3. Phases 4 + 5 in parallel (US2 toggle + US3 setting) → feature complete
4. Phase 6 → validated and packaged

---

## Notes

- [P] = different files, no blocking dependency — safe to run in parallel
- [SYNC] = requires human judgment; do not fully delegate
- [ASYNC] = well-specified boilerplate; safe to delegate to an agent
- TDD order is ENFORCED by constitution — no exceptions
- `npm test` must exit 0 at every checkpoint before moving to the next phase
