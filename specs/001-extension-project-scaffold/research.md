# Research: Extension Scaffold

**Branch**: `001-extension-scaffold` | **Date**: 2026-04-15

## Decision 1: Bundler

**Decision**: esbuild via a custom `esbuild.js` script.

**Rationale**: As of 2025, the official VS Code Yeoman generator scaffolds new extensions
with esbuild by default. It requires zero `ts-loader`/`babel-loader` config, builds
significantly faster than webpack, and has no conflicts with strict TypeScript. Webpack
remains an option but is no longer the recommended default.

**Alternatives considered**: webpack — rejected; more configuration overhead, slower
builds, no benefits for a TypeScript-only extension with no custom transforms.

**Key config**:

```js
// esbuild.js
esbuild.build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],       // vscode is provided by the host, never bundled
  format: 'cjs',
  platform: 'node',
  sourcemap: true,
});
```

`"main": "./dist/extension.js"` in package.json.
`vscode:prepublish` hook calls `npm run package` (minified build).

---

## Decision 2: Test framework and coverage

**Decision**: Vitest with `@vitest/coverage-v8`, plain `resolve.alias` mock for `vscode`.

**Rationale**: Vitest runs in Node.js and cannot import the real `vscode` module (only
available in the VS Code extension host). The standard pattern is to alias `vscode` to
a hand-rolled mock in `vitest.config.ts`. V8 coverage (not Istanbul) is preferred because
it requires no Babel/SWC instrumentation transforms and has no conflicts with esbuild.
Istanbul is more precise for branch coverage on ternaries but adds configuration
complexity; V8 is production-appropriate for this project.

**Alternatives considered**: `@vitest/coverage-istanbul` — rejected; requires
instrumentation transforms that conflict with esbuild, higher configuration cost.
`jest` — rejected; constitution mandates Vitest.

**Known issues**:

- The `vscode` mock does not satisfy TypeScript's full `vscode` type definitions.
  Use `as unknown as typeof import('vscode')` casts or `vi.mocked()` at callsites.
- `coverage.include: ['src/**/*.ts']` is **mandatory** — without it, V8 instruments
  all touched files including node_modules, inflating coverage noise.
- If `"type": "module"` in package.json, use `vitest.config.mts` and
  `"moduleResolution": "bundler"` in tsconfig to avoid `ERR_REQUIRE_ESM`.

**Key vitest.config.ts shape**:

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: { vscode: path.resolve(__dirname, '__mocks__/vscode.ts') },
  },
});
```

---

## Decision 3: CustomTextEditorProvider priority and dynamic default

**Decision**: Set `"priority": "option"` in `package.json`. Drive all custom editor
opens programmatically from `activate()` by intercepting `onDidOpenTextDocument`.

**Rationale**: The alternative — set `"priority": "default"` and immediately re-route
inside `resolveCustomTextEditor` when the setting says "text editor" — causes a
re-entrant open: VS Code tears down the half-initialized webview and the user sees
tab flicker. The VS Code docs explicitly discourage calling `openWith` from inside
`resolveCustomTextEditor`. The correct pattern is:

1. `"priority": "option"` — extension never auto-hijacks file opens.
2. In `activate()`, listen on `vscode.workspace.onDidOpenTextDocument`.
3. When a `.md` doc opens and the user setting is `"webview"`, call:
   `vscode.commands.executeCommand('vscode.openWith', doc.uri, 'visualMarkdown.editor')`
4. When the setting is `"textEditor"`, do nothing — VS Code's text editor handles it.

**Alternatives considered**: `"priority": "default"` with re-routing in
`resolveCustomTextEditor` — rejected; causes flicker and re-entrant open race.

---

## Decision 4: Raw mode toggle command

**Decision**: `vscode.commands.executeCommand('vscode.openWith', document.uri, 'default')`

**Rationale**: `'default'` is the registered VS Code sentinel viewType that resolves to
the built-in text editor, bypassing all custom editor registrations regardless of
priority. This is the correct programmatic API.

**Alternatives considered**: `'workbench.action.reopenWithEditor'` — rejected; this is
a UI command that opens the interactive "Reopen Editor With..." picker. It has no
parameters and is not suitable for programmatic use.

---

## Decision 5: Webview message protocol for raw mode toggle

**Decision**: The webview sends a `{ type: 'openRaw' }` message to the extension host.
The extension host calls `vscode.openWith` in response.

**Rationale**: VS Code webviews are sandboxed — they cannot call VS Code API directly.
All VS Code API calls must go through the extension host via `postMessage` / `onDidReceiveMessage`.
The toggle button in the webview posts a message; the provider handles it.
