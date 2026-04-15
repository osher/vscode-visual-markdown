# Feature Specification: Monorepo Structure & GitHub Actions CI

**Feature Branch**: `002-github-ci`
**Created**: 2026-04-15
**Status**: Draft
**Input**: User description: "github validation ci"

**Goal**: Restructure the repo as a monorepo with the extension isolated under `visual-markdown/`, introduce `Taskfile.yml` as the sole developer entrypoint, wire git hooks and GitHub Actions CI through it, and establish a full quality gate suite where each check runs as an independent CI job.

**Success Criteria**: Monorepo structure in place; `task validate` passes locally; each CI check is a separate green job on a clean repo; README establishes `task` as the primary interface.

**Constraints**: GitHub remote required; `ubuntu-latest` free tier; Node.js pinned via `.nvmrc`; tasks delegate to `npm` internally; checks in scope: vitest+coverage, ESLint, markdownlint, jscpd; every public task has `desc` + `summary`, every internal task has at least one.

## Demo Sentence *(mandatory)*

**After this feature, the user can:** clone the repo, run `task bootstrap` to install tools, run `task` to discover all available operations, run `task validate` before pushing, and open a PR knowing each check runs as a separate CI job with a clear green/red status per check.

## Boundary Map

### Produces

| Artifact | Type | Exports/Provides |
|----------|------|------------------|
| `visual-markdown/` | Package directory | VS Code extension source, isolated from root tooling |
| `Taskfile.yml` | Task orchestrator | All developer operations via named tasks |
| `.github/workflows/ci.yml` | CI workflow | Per-check jobs triggered on push and PR |
| `README.md` | Documentation | go-task install guide and developer onboarding |

### Consumes

| From Feature | Artifact | Imports/Uses |
|--------------|----------|--------------|
| 001-extension-project-scaffold | All source files | Moved into `visual-markdown/` |

## User Scenarios & Testing

### User Story 1 — Developer Onboarding (Priority: P1)

A developer clones the repo for the first time and needs to know how to get started. They follow the README, install go-task, run `task bootstrap`, then run `task` to see what's available.

**Why this priority**: All other stories depend on the task runner being installed and understood. Without this, nothing else works.

**Independent Test**: Can be verified by following the README steps on a clean machine and reaching a state where `task` lists all available tasks without error.

**Acceptance Scenarios**:

1. **Given** a freshly cloned repo, **When** a developer reads the README, **Then** they find clear instructions to install go-task (`brew install go-task` / `winget install Task.Task`) and set up shell completion.
2. **Given** go-task is installed, **When** the developer runs `task bootstrap`, **Then** all required tools are installed without manual intervention.
3. **Given** tools are installed, **When** the developer runs `task` with no arguments, **Then** all available tasks are listed with their descriptions.

---

### User Story 2 — Monorepo Structure (Priority: P2)

A developer opens the repo and finds the extension source cleanly isolated under `visual-markdown/`, with tooling, specs, and automation at the root level and not mixed into the extension directory.

**Why this priority**: Structural prerequisite — CI and task wiring assume the new layout.

**Independent Test**: Can be verified by inspecting the directory structure and confirming the extension builds and tests pass from within `visual-markdown/`.

**Acceptance Scenarios**:

1. **Given** the restructured repo, **When** a developer inspects the root, **Then** `visual-markdown/`, `specs/`, `.github/`, and `Taskfile.yml` are at the root with no extension source files mixed in.
2. **Given** the moved extension, **When** `task test` is run, **Then** all tests pass and coverage meets the 100% gate.
3. **Given** the moved extension, **When** `task build` is run, **Then** the extension compiles without errors.

---

### User Story 3 — Local Quality Gate (Priority: P3)

A developer runs `task validate` before pushing. All checks — build, tests, lint, markdown lint, copy-paste detection — execute locally and the result is clear: pass or fail per check.

**Why this priority**: Prevents broken commits from reaching CI; supports the pre-commit hook.

**Independent Test**: Can be verified by intentionally introducing a lint error, running `task validate`, and confirming it fails at the lint step.

**Acceptance Scenarios**:

1. **Given** a clean repo, **When** `task validate` is run, **Then** all checks pass and the command exits 0.
2. **Given** a lint violation exists, **When** `task validate` is run, **Then** the lint check fails visibly and the command exits non-zero.
3. **Given** a git pre-commit hook is installed, **When** a developer commits, **Then** `task validate` (or equivalent) runs automatically and blocks the commit if any check fails.

---

### User Story 4 — GitHub Actions CI (Priority: P4)

A developer pushes a branch or opens a PR. GitHub Actions triggers a workflow where each check runs as an independent job. All jobs are green on a clean repo. A single failing check produces a red status on that job only.

**Why this priority**: Remote validation; depends on all prior stories being complete.

**Independent Test**: Can be verified by pushing a clean branch and observing all CI jobs green, then introducing a violation and observing the specific job turn red.

**Acceptance Scenarios**:

1. **Given** a push to any branch, **When** CI triggers, **Then** separate jobs run for: build, test+coverage, lint, markdownlint, jscpd.
2. **Given** all checks pass, **When** CI completes, **Then** a green check appears on the commit/PR with no manual steps.
3. **Given** a test failure exists, **When** CI runs, **Then** only the test job fails; other jobs complete independently.
4. **Given** the GitHub repo does not yet exist, **When** this feature is implemented, **Then** `gh repo create` (or equivalent) establishes the remote as part of setup.

---

### Edge Cases

- What happens if go-task is not installed when a developer runs a task command? → README and `task bootstrap` must cover the install path clearly.
- What happens if the extension fails to build after the move to `visual-markdown/`? → Path references inside `esbuild.js`, `tsconfig.json`, `vitest.config.ts` must be updated to reflect the new location.
- What happens if a CI job runs but `task` is not installed on the runner? → `task bootstrap` or a dedicated CI setup step must install go-task before any task is invoked.
- What if jscpd or markdownlint are not installed locally? → `task bootstrap` must install all check dependencies.

## Requirements

### Functional Requirements

- **FR-001**: The repo MUST be restructured so that all extension source (`src/`, `tests/`, `__mocks__/`, `dist/`, `coverage/`, `package.json`, `tsconfig.json`, `vitest.config.ts`, `esbuild.js`) lives under `visual-markdown/`.
- **FR-002**: A `Taskfile.yml` at the repo root MUST be the sole entrypoint for all developer operations; `npm` commands MUST NOT be the primary interface.
- **FR-003**: The default task (`task` with no arguments) MUST list all available tasks with descriptions.
- **FR-004**: A `task validate` task MUST run all quality checks locally as a coordinated sequence.
- **FR-005**: A `task bootstrap` task MUST install all required tools (go-task, node tooling, linters) on a fresh developer machine.
- **FR-006**: Individual check tasks MUST exist for: `task test`, `task lint`, `task lint:md`, `task cpd`, `task build`.
- **FR-007**: A git pre-commit hook MUST invoke `task validate` (or equivalent) and block the commit on failure.
- **FR-008**: A GitHub Actions workflow MUST trigger on push and PR events with each check as a separate job.
- **FR-009**: Each CI job MUST invoke its corresponding task (e.g., `task test`, `task lint`).
- **FR-010**: The GitHub remote repository MUST be created and configured as part of this feature's setup.
- **FR-011**: Every public task MUST include both `desc` and `summary` fields; every internal task MUST include at least one.
- **FR-012**: A `README.md` MUST document go-task installation, shell completion setup, and `task` as the primary developer interface.

### Non-Functional Requirements

- **NFR-001**: CI jobs MUST run on `ubuntu-latest` using GitHub-hosted runners (free tier).
- **NFR-002**: Node.js version MUST be pinned via `.nvmrc` and used consistently in local dev and CI.
- **NFR-003**: All checks MUST complete within a reasonable time on a standard developer machine (no hard limit, but no unnecessary re-work between checks).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Extension source files are fully contained under `visual-markdown/`; zero extension source files exist at repo root.
- **SC-002**: `task` (no arguments) produces a complete task listing; no undescribed public tasks exist.
- **SC-003**: `task validate` exits 0 on a clean repo and non-zero on any violation.
- **SC-004**: GitHub Actions CI produces 5+ separate jobs (build, test, lint, lint:md, cpd), each independently green on a clean repo.
- **SC-005**: A new developer can reach a working `task validate` pass by following only the README.

## Assumptions

- The existing extension code (`src/`, `tests/`, `__mocks__/`, config files) moves to `visual-markdown/` without changes to logic — only paths are updated.
- ESLint configuration applies to TypeScript files in `visual-markdown/src/` and `visual-markdown/tests/`.
- markdownlint applies to all `.md` files at the repo root and in `specs/`.
- jscpd scans `visual-markdown/src/` for copy-paste detection; generated files (`dist/`, `coverage/`) are excluded.
- go-task v3 is the target version (current stable).
- The GitHub repo is created as public; this can be adjusted without spec change.

## Risk Register

- RISK: Path breakage after monorepo move | Severity: High | Impact: Extension fails to build or tests fail due to updated `__dirname`, import paths, or config `rootDir` | Test: Run `task build` and `task test` immediately after restructure and confirm both pass.
- RISK: CI installs go-task but wrong version | Severity: Medium | Impact: Task syntax incompatibility between local and CI | Test: Pin go-task version in CI setup step and verify parity with local `.nvmrc`-equivalent for task.
- RISK: Pre-commit hook skipped via `--no-verify` | Severity: Low | Impact: Broken code reaches remote | Test: Out of scope — developer discipline; document in README.
