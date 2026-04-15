<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0 (initial ratification)
Modified principles: N/A — first version
Added sections: Core Principles, Extension Architecture, Development Workflow, Governance
Templates reviewed (READ-ONLY):
  - .specify/templates/plan-template.md — Constitution Check section present; gates to be
    defined per feature plan. No update required.
  - .specify/templates/spec-template.md — Requirements section aligned with principle-driven
    acceptance criteria. No update required.
  - .specify/templates/tasks-template.md — Task categorization compatible. No update required.
Follow-up TODOs: None. All placeholders resolved.
-->

# Visual Markdown Constitution

## Core Principles

### I. Obsidian-Style Live Preview

The editor renders markdown inline. Raw syntax is exposed only on the line the cursor
currently occupies. No other line shows raw syntax during normal editing. This is the
defining UX contract of the extension — every feature must preserve it.

### II. Serialization Preserves User Intent

A save operation must only change bytes the user explicitly edited. Serialization must
not reformat, reorder, or normalize content the user did not touch. Format normalization,
if introduced, must be opt-in and explicit. This principle accommodates integration with
external linters: if the user's linter controls format, that is the authoritative source
of formatting decisions.

### III. Test-First (NON-NEGOTIABLE)

The red → green → refactor loop is mandatory for all non-trivial logic:

- Write a failing test first
- Make it pass with the minimum viable implementation
- Refactor under green

Full coverage is required. The implementation level chooses the tooling and test harness
to achieve it within the constraints of the VS Code extension runtime.

### IV. Webview + CodeMirror 6 Architecture

The extension uses `CustomTextEditorProvider` to register as the editor for `.md` files.
CodeMirror 6 runs inside the webview. The extension host manages the `TextDocument`.
No alternative rendering strategy (e.g., native editor decoration API) may be introduced
without a formal constitution amendment, as this decision is load-bearing for feature
capabilities (inline images, Mermaid diagrams, rich block elements).

### V. Complexity Must Be Justified

Introduce complexity only when a simpler alternative has been explicitly considered and
rejected. YAGNI applies. No speculative abstractions, no premature generalization.
Every deviation from the simplest viable approach must be documented at the plan level.

## Extension Architecture Constraints

- **Language**: TypeScript, strict mode mandatory
- **Editor engine**: CodeMirror 6 (inside webview)
- **VS Code integration**: `CustomTextEditorProvider` — registered as the default editor
  for `.md` files
- **Required capabilities**: inline image rendering, Mermaid diagram rendering, live
  preview of all standard CommonMark elements
- **CI**: GitHub Actions — all commits must pass the CI pipeline before merge

## Development Workflow

- All features follow the speckit spec → plan → tasks → implement pipeline
- Tests are written before implementation (see Principle III)
- The CI pipeline is the quality gate — no bypass permitted
- Each principle in this constitution maps to verifiable acceptance criteria in specs
  and plans; reviewers must check alignment explicitly

## Governance

This constitution supersedes all other practices and guidelines. In case of conflict,
the constitution wins.

**Amendment procedure**:

1. Edit this file with the change
2. Bump `CONSTITUTION_VERSION` (MAJOR: principle removed or redefined;
   MINOR: principle added or materially expanded; PATCH: clarification or wording fix)
3. Update `LAST_AMENDED_DATE` to today
4. Add a changelog entry below explaining: what changed, what the old rule was, and why
   it changed

**Compliance**: All PRs, specs, and plans must be checked against this constitution
before approval. Violations must be flagged and resolved, not bypassed.

---

### Amendment Changelog

<!-- Add entries here when the constitution is amended. Format:
     **vX.Y.Z — YYYY-MM-DD**: What changed, what the old rule was, why it changed. -->

*(no amendments yet)*

---

**Version**: 1.0.0 | **Ratified**: 2026-04-15 | **Last Amended**: 2026-04-15
