# Feature Checklist: Extension Scaffold

**Purpose**: Lightweight self-check — requirements completeness and clarity across all 4 user stories
**Created**: 2026-04-15
**Feature**: [spec.md](../spec.md)

## US1 — Open Markdown File in Webview

- [x] CHK001 Is the expected webview content (placeholder text, toggle button) described precisely enough to know when it passes? [Clarity, Spec §US1] — US1 AC1 specifies both placeholder and toggle button explicitly.
- [x] CHK002 Are acceptance criteria defined for what "no errors in extension host logs" means — warnings included or excluded? [Clarity, Spec §US1 AC2] — AC2 explicitly says "no errors or warnings".
- [x] CHK003 Is the activation behavior for non-`.md` files (FR-006) referenced in US1 or only in requirements? [Consistency, Spec §FR-006] — covered in Edge Cases section and FR-006.

## US2 — Toggle to Raw Markdown View

- [x] CHK004 Is the expected behavior after toggle specified — same tab, new tab, or replace? [Clarity, Spec §US2] — US2 AC1 says "reopens" implying same tab replacement; implemented and verified.
- [ ] CHK005 Is the toggle's behavior on repeat clicks specified (e.g. already in raw mode)? [Coverage, Gap] — not addressed in spec.
- [ ] CHK006 Are requirements defined for what happens if `vscode.openWith` fails silently? [Edge Case, Gap] — not addressed; acceptable for scaffold.

## US3 — Control Default Editor via Setting

- [ ] CHK007 Is the setting's effect scope defined — workspace-level, user-level, or both? [Clarity, Spec §FR-005] — spec omits scope; data-model.md has it (`Global`) but spec does not.
- [x] CHK008 Is the behavior defined for when the setting is changed while a `.md` file is already open? [Coverage, Spec §US3 AC3] — AC3 explicitly says "next file open"; currently open files unaffected.
- [x] CHK009 Is the fallback for an unrecognized setting value documented in the spec (not just in code)? [Completeness, Gap] — Edge Cases section: "must fall back to the webview default without crashing".

## US4 — Test Coverage Gate

- [ ] CHK010 Is the coverage scope (which files count) explicitly stated in the spec? [Clarity, Spec §FR-008] — spec says "100% coverage gate" but does not name which files are included; implemented as `src/**/*.ts`.
- [ ] CHK011 Are the four coverage dimensions (lines, branches, functions, statements) all required, or is a subset acceptable? [Completeness, Spec §FR-008] — spec says "100%" without specifying dimensions; all four enforced in implementation.
- [x] CHK012 Is the HTML report output location specified, or left to implementation? [Clarity, Spec §FR-009] — Assumptions section: "`coverage/` directory at the project root".

## Cross-Cutting

- [x] CHK013 Are all FR items traceable to at least one acceptance scenario in a user story? [Traceability] — FR-001 through FR-009 all map to at least one AC or Edge Case entry.
- [x] CHK014 Are the Demo Sentence and Success Criteria consistent with each other? [Consistency, Spec §Demo] — Demo sentence and SC-001–SC-005 cover the same scope with no contradictions.
- [x] CHK015 Does the spec explicitly state what is out of scope (CI, CodeMirror) so a reader cannot misinterpret the feature boundary? [Clarity, Spec §Constraints] — Constraints section names both explicitly.
