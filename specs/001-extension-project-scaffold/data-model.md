# Data Model: Extension Scaffold

**Branch**: `001-extension-scaffold` | **Date**: 2026-04-15

This feature has no persistent data entities. The relevant "model" is the configuration
schema and the webview message protocol.

---

## Configuration

### `visualMarkdown.defaultEditor`

| Property | Value |
|---|---|
| Type | `enum` |
| Values | `"webview"` (default), `"textEditor"` |
| Scope | `vscode.ConfigurationTarget.Global` |
| Description | Controls whether `.md` files open in the Visual Markdown webview or VS Code's built-in text editor by default. |

Declared in `package.json` under `contributes.configuration`. Read at runtime via
`vscode.workspace.getConfiguration('visualMarkdown').get('defaultEditor')`.

---

## Webview Message Protocol

Messages flow **webview → extension host only** in this feature (the webview has no
state to send back, and the host sends no messages down to the webview at this stage).

### `OpenRawMessage`

```ts
interface OpenRawMessage {
  type: 'openRaw';
}
```

**Trigger**: User clicks the raw mode toggle button in the webview.
**Handler**: `VisualMarkdownEditorProvider.onDidReceiveMessage` calls
`vscode.commands.executeCommand('vscode.openWith', document.uri, 'default')`.

---

## VS Code Contribution Points (package.json schema)

### `contributes.customEditors`

```json
{
  "viewType": "visualMarkdown.editor",
  "displayName": "Visual Markdown",
  "selector": [{ "filenamePattern": "*.md" }],
  "priority": "option"
}
```

`"priority": "option"` — extension does not auto-hijack `.md` opens. Programmatic
routing from `activate()` drives the default behavior based on user setting.

### `contributes.configuration`

```json
{
  "title": "Visual Markdown",
  "properties": {
    "visualMarkdown.defaultEditor": {
      "type": "string",
      "enum": ["webview", "textEditor"],
      "default": "webview",
      "description": "Controls the default editor for .md files."
    }
  }
}
```
