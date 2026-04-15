import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// Uri
// ---------------------------------------------------------------------------
export const Uri = {
  file: vi.fn((p: string) => ({ fsPath: p, toString: () => p })),
  parse: vi.fn((s: string) => ({ fsPath: s, toString: () => s })),
};

// ---------------------------------------------------------------------------
// WebviewPanel
// ---------------------------------------------------------------------------
export function makeWebviewPanel() {
  const onDidReceiveMessageCallbacks: Array<(msg: unknown) => void> = [];
  return {
    webview: {
      html: '',
      options: {} as { enableScripts?: boolean },
      onDidReceiveMessage: vi.fn((cb: (msg: unknown) => void) => {
        onDidReceiveMessageCallbacks.push(cb);
        return { dispose: vi.fn() };
      }),
      postMessage: vi.fn(),
      _fireMessage: (msg: unknown) => {
        onDidReceiveMessageCallbacks.forEach((cb) => cb(msg));
      },
    },
    onDidDispose: vi.fn(() => ({ dispose: vi.fn() })),
    reveal: vi.fn(),
    dispose: vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// window
// ---------------------------------------------------------------------------
export const window = {
  showInformationMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  registerCustomEditorProvider: vi.fn(() => ({ dispose: vi.fn() })),
  createOutputChannel: vi.fn(() => ({ appendLine: vi.fn(), dispose: vi.fn() })),
};

// ---------------------------------------------------------------------------
// workspace
// ---------------------------------------------------------------------------
const configValues: Record<string, unknown> = {};

export const workspace = {
  getConfiguration: vi.fn((_section?: string) => ({
    get: vi.fn((key: string, defaultValue?: unknown) =>
      configValues[key] !== undefined ? configValues[key] : defaultValue
    ),
    update: vi.fn(),
  })),
  onDidOpenTextDocument: vi.fn(() => ({ dispose: vi.fn() })),
  _setConfig: (key: string, value: unknown) => {
    configValues[key] = value;
  },
  _clearConfig: () => {
    Object.keys(configValues).forEach((k) => delete configValues[k]);
  },
};

// ---------------------------------------------------------------------------
// commands
// ---------------------------------------------------------------------------
export const commands = {
  executeCommand: vi.fn(),
  registerCommand: vi.fn(() => ({ dispose: vi.fn() })),
};

// ---------------------------------------------------------------------------
// ExtensionContext
// ---------------------------------------------------------------------------
export const ExtensionContext = {
  subscriptions: [] as Array<{ dispose: () => void }>,
};

export function makeExtensionContext() {
  return {
    subscriptions: [] as Array<{ dispose: () => void }>,
  };
}

// ---------------------------------------------------------------------------
// ViewColumn
// ---------------------------------------------------------------------------
export const ViewColumn = { One: 1, Two: 2, Three: 3, Active: -1, Beside: -2 };

// ---------------------------------------------------------------------------
// CustomTextEditorProvider (type marker only — implemented by extension)
// ---------------------------------------------------------------------------
export const CustomTextEditorProvider = {};
