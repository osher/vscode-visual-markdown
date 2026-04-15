# Implementation Plan: Extension Scaffold

**Branch**: `001-extension-scaffold` | **Date**: 2026-04-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-extension-scaffold/spec.md`

## Summary

Scaffold a VS Code extension that opens `.md` files in a webview by default using
`CustomTextEditorProvider`. The webview renders a placeholder with a raw mode toggle.
A user setting controls the default. Vitest is wired for 100% coverage with plain and
HTML reporters. esbuild handles bundling.

Key architectural decision from research: `"priority": "option"` in package.json;
programmatic routing from `activate()` via `onDidOpenTextDocument` drives the default
behavior. Raw mode toggle uses `vscode.openWith(uri, 'default')` from the extension
host, triggered by a webview `postMessage`.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode, Node.js LTS (18+)
**Primary Dependencies**: `vscode` API (1.80+), `esbuild` (bundler), `vitest`,
`@vitest/coverage-v8`
**Storage**: N/A — no database; VS Code `workspace.getConfiguration` for settings
**Testing**: Vitest (unit, Node environment); `@vscode/test-electron` out of scope
**Target Platform**: VS Code 1.80+ on Linux / macOS / Windows
**Project Type**: VS Code extension
**Performance Goals**: Extension activation within normal VS Code editor open time
**Constraints**: Webview sandboxed — no VS Code API calls from webview directly;
all API calls via `postMessage` / `onDidReceiveMessage`; CSP required on webview HTML
**Scale/Scope**: Single-user desktop extension; no concurrency concerns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I. Obsidian-Style Live Preview | Webview renders placeholder only — full live preview deferred to next feature. Acceptable for scaffold. | ✅ PASS |
| II. Serialization Preserves User Intent | No serialization in this feature — read-only placeholder webview. | ✅ N/A |
| III. Test-First (NON-NEGOTIABLE) | Vitest + 100% coverage gate enforced from day one. Tests written before implementation. | ✅ PASS |
| IV. Webview + CodeMirror 6 Architecture | `CustomTextEditorProvider` + webview confirmed. CodeMirror deferred to next feature — scaffold only. | ✅ PASS |
| V. Complexity Must Be Justified | Single project structure, no abstractions beyond what the three source modules require. | ✅ PASS |

**Post-design re-check**: No violations introduced in Phase 1 design. The
`"priority": "option"` + programmatic routing pattern avoids re-entrant open issues
and aligns with VS Code API best practices. No unjustified complexity added.

## Project Structure

### Documentation (this feature)

```text
specs/001-extension-scaffold/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research decisions
├── data-model.md        # Configuration schema and message protocol
├── quickstart.md        # Developer setup guide
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/spec.tasks — not yet created)
```

### Source Code (repository root)

```text
vscode-visual-markdown/
├── src/
│   ├── extension.ts                     # activate() / deactivate()
│   ├── VisualMarkdownEditorProvider.ts  # CustomTextEditorProvider
│   ├── settings.ts                      # read visualMarkdown.defaultEditor
│   └── webview/
│       └── index.html                   # placeholder webview HTML (static)
├── __mocks__/
│   └── vscode.ts                        # Vitest mock for vscode module
├── tests/
│   ├── extension.test.ts
│   ├── VisualMarkdownEditorProvider.test.ts
│   └── settings.test.ts
├── dist/                                # esbuild output (gitignored)
├── coverage/                            # Vitest coverage output (gitignored)
├── esbuild.js                           # build script
├── vitest.config.ts
├── tsconfig.json
├── package.json
└── .vscodeignore
```

**Structure Decision**: Single project, flat `src/` layout. No `lib/` or `services/`
subdirectories — three modules only, each matching a functional boundary from the spec
(activation, provider, settings). Tests mirror source structure 1:1.

## Triage Framework: [SYNC] vs [ASYNC] Classification

### Triage Audit Trail

| Task | Classification | Primary Criteria | Risk Level | Rationale |
|---|---|---|---|---|
| `package.json` (contributes, scripts, engines) | [SYNC] | Architectural — contribution points define extension identity | High | Wrong `viewType`, `priority`, or `engines.vscode` silently breaks activation |
| `tsconfig.json` + `esbuild.js` | [ASYNC] | Standard boilerplate, well-defined output | Low | Established patterns from research; no business logic |
| `vitest.config.ts` + coverage config | [SYNC] | Quality gate setup — 100% threshold, alias, include | Medium | Misconfigured `include` silently inflates coverage; threshold must be verified |
| `__mocks__/vscode.ts` | [SYNC] | Mock completeness determines test reliability | Medium | Missing stubs cause test failures or false passes; must be reviewed |
| `src/settings.ts` | [ASYNC] | Simple read from `workspace.getConfiguration` | Low | Single function, straightforward, fully testable |
| `src/VisualMarkdownEditorProvider.ts` | [SYNC] | Core architecture — `resolveCustomTextEditor`, message handling, `openWith` routing | High | Architectural boundary; `onDidReceiveMessage` + `openWith` wiring is non-trivial |
| `src/extension.ts` (activate) | [SYNC] | VS Code lifecycle + `onDidOpenTextDocument` routing logic | High | Activation event timing and setting-driven routing are critical correctness concerns |
| `src/webview/index.html` | [ASYNC] | Static HTML placeholder with CSP header and toggle button | Low | No logic; just markup and one `postMessage` call |
| Test files (3×) | [SYNC] | Test-first gate — must fail before implementation | Medium | Tests define the contract; written before source files exist |
| `.vscodeignore` | [ASYNC] | Standard exclusion list | Low | Boilerplate |

## Complexity Tracking

No constitution violations. Section not applicable for this feature.
