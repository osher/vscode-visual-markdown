# Feature Specification: Extension Scaffold

**Feature Branch**: `001-extension-scaffold`
**Created**: 2026-04-15
**Status**: Draft
**Input**: Scaffold a VS Code extension with a webview-based custom text editor, raw mode
toggle, user setting for default editor, and Vitest with 100% coverage reporting.

**Goal**: Scaffold a production-ready VS Code extension that opens `.md` files in a
webview by default, with a raw mode toggle and a user setting to control the default
editor.
**Success Criteria**: Extension builds and activates without errors; raw mode toggle
works; 100% test coverage enforced with plain and HTML reporters.
**Constraints**: TypeScript strict mode; webview architecture; no CodeMirror yet;
no GitHub Actions CI yet.

## Demo Sentence *(mandatory)*

**After this feature, the user can:** open a `.md` file in VS Code and immediately see
the extension's webview with a raw mode toggle, click the toggle to switch to the
built-in text editor, flip a setting to change the default behavior — all with no console
errors — then run `npm test` and see a passing suite with 100% coverage output in both
plain text and HTML.

## Boundary Map *(mandatory for multi-feature projects)*

### Produces

| Artifact | Type | Exports/Provides |
|----------|------|------------------|
| `src/extension.ts` | Entry point | Extension activation, provider registration |
| `src/VisualMarkdownEditorProvider.ts` | Module | `CustomTextEditorProvider` implementation |
| `src/settings.ts` | Module | Setting read/write for default editor preference |

### Consumes

| From Feature | Artifact | Imports/Uses |
|--------------|----------|--------------|
| *(none — foundation feature)* | - | - |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open Markdown File in Webview (Priority: P1)

A user opens a `.md` file in VS Code. The extension activates and renders the file in a
webview displaying a placeholder and a visible "Edit Raw" toggle button. No errors appear
in the extension host logs.

**Why this priority**: Foundational activation path — every other story depends on the
webview opening correctly.

**Independent Test**: Open any `.md` file and verify the webview activates with the
placeholder UI and toggle visible, with no log errors.

**Acceptance Scenarios**:

1. **Given** a `.md` file exists in the workspace, **When** the user opens it, **Then**
   the extension's webview opens as the editor, showing a placeholder and a visible raw
   mode toggle button.
2. **Given** the webview is open, **When** the extension host logs are inspected,
   **Then** no errors or warnings originating from the extension are present.

---

### User Story 2 - Toggle to Raw Markdown View (Priority: P2)

The user clicks the "Edit Raw" toggle inside the webview. VS Code reopens the file in
the built-in text editor showing the raw markdown source.

**Why this priority**: Without this toggle, users have no way to access raw markdown once
the extension is the default editor. It is a core UX safety valve.

**Independent Test**: With the webview open, click the toggle and verify the file reopens
in VS Code's native text editor.

**Acceptance Scenarios**:

1. **Given** a `.md` file is open in the webview, **When** the user clicks the raw mode
   toggle, **Then** the file reopens in VS Code's built-in text editor showing raw
   markdown.
2. **Given** the user has switched to raw mode, **When** they close and reopen the file,
   **Then** the webview opens again — the toggle action does not permanently change the
   default.

---

### User Story 3 - Control Default Editor via Setting (Priority: P3)

The user opens VS Code settings and finds a Visual Markdown setting to control whether
the extension or the built-in text editor is the default for `.md` files. Changing the
setting takes effect on the next file open.

**Why this priority**: Allows users who prefer raw markdown by default to opt out without
uninstalling the extension.

**Independent Test**: Set the preference to "text editor as default", reopen a `.md`
file, and verify it opens in the native text editor.

**Acceptance Scenarios**:

1. **Given** the setting is "text editor as default", **When** the user opens a `.md`
   file, **Then** the file opens in VS Code's built-in text editor.
2. **Given** the setting is "webview as default" (factory default), **When** the user
   opens a `.md` file, **Then** the file opens in the extension's webview.
3. **Given** the setting is changed, **When** the user opens a `.md` file, **Then** the
   new setting is respected without requiring a VS Code restart.

---

### User Story 4 - Run Tests with Full Coverage (Priority: P4)

A developer runs the test suite and sees all tests pass with 100% coverage. Coverage
output is available in both plain text (terminal) and HTML (browsable report).

**Why this priority**: Establishes the quality gate from day one. All future features
inherit this baseline.

**Independent Test**: Run `npm test` and verify: exit code 0, 100% coverage in terminal,
and an HTML report generated in the coverage output directory.

**Acceptance Scenarios**:

1. **Given** the project is set up, **When** the developer runs `npm test`, **Then** all
   tests pass, 100% coverage is reported in the terminal, and an HTML report is generated.
2. **Given** `npm test` has completed, **When** the developer opens the HTML coverage
   report, **Then** all source files show 100% line, branch, and function coverage.
3. **Given** a source file has an untested code path, **When** the developer runs
   `npm test`, **Then** the suite fails and the uncovered path is identified in the
   output.

---

### Edge Cases

- What happens when a non-`.md` file is opened? The extension must not activate.
- What happens when the `.md` file is empty? The webview must still render without errors.
- What happens when the setting value is unrecognized or corrupted? The extension must
  fall back to the webview default without crashing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST register as a `CustomTextEditorProvider` for `.md` files.
- **FR-002**: The extension MUST open `.md` files in the webview by default (factory
  default).
- **FR-003**: The webview MUST display a visible toggle to switch to raw markdown view.
- **FR-004**: Activating the raw mode toggle MUST reopen the file in VS Code's built-in
  text editor.
- **FR-005**: The extension MUST expose a user-configurable setting to control whether the
  webview or built-in text editor is the default for `.md` files.
- **FR-006**: The extension MUST NOT activate for file types other than `.md`.
- **FR-007**: The extension MUST NOT produce errors in the extension host log during
  normal activation and use.
- **FR-008**: The test suite MUST enforce a 100% coverage gate; falling below threshold
  MUST cause the suite to exit with a non-zero code.
- **FR-009**: Coverage reports MUST be produced in both plain text and HTML formats on
  every test run.

### Non-Functional Requirements

- **NFR-001**: The extension MUST be written in TypeScript with strict mode enabled.
- **NFR-002**: The extension MUST activate within normal VS Code editor open time with no
  perceptible additional delay.
- **NFR-003**: The webview MUST load without errors on an empty `.md` file.

### Quality Attributes

- **Maintainability**: TypeScript strict mode enforced; 100% test coverage gate enforced
  from day one; no untested code paths permitted.
- **Reliability**: Extension must not crash or produce log errors under normal use,
  including on empty files and non-`.md` files.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Opening a `.md` file results in the webview activating with no extension
  host log errors.
- **SC-002**: The raw mode toggle successfully reopens the file in the built-in text
  editor 100% of the time.
- **SC-003**: The default editor setting change is respected on the next file open without
  a VS Code restart.
- **SC-004**: Running `npm test` produces exit code 0 with 100% coverage and generates
  both plain text and HTML reports.
- **SC-005**: The extension does not interfere with non-`.md` file types.

## Assumptions

- The extension targets VS Code 1.80+ (stable, `CustomTextEditorProvider` supported).
- The webview content is a static HTML placeholder — no markdown rendering, no CodeMirror.
- "Raw mode toggle" reopens the file using VS Code's built-in reopen-with mechanism; it
  does not embed a text editor inside the webview.
- The HTML coverage report is written to a `coverage/` directory at the project root.
- Automated tests cover extension host logic only; VS Code runtime integration testing
  (actual webview activation in a running VS Code window) is out of scope for this
  feature.
- The setting identifier follows VS Code convention: `visualMarkdown.defaultEditor` with
  values `"webview"` (default) and `"textEditor"`.
