import { describe, it, expect, vi, beforeEach } from 'vitest';
import { window, workspace, commands, makeExtensionContext } from '../__mocks__/vscode';

import { activate, deactivate } from '../src/extension';

describe('deactivate()', () => {
  it('runs without throwing', () => {
    expect(() => deactivate()).not.toThrow();
  });
});

describe('activate()', () => {
  let context: ReturnType<typeof makeExtensionContext>;

  beforeEach(() => {
    vi.clearAllMocks();
    workspace._clearConfig();
    context = makeExtensionContext();
  });

  it('registers a CustomTextEditorProvider with viewType "visualMarkdown.editor"', () => {
    activate(context as never);
    expect(window.registerCustomEditorProvider).toHaveBeenCalledWith(
      'visualMarkdown.editor',
      expect.anything(),
      expect.anything()
    );
  });

  it('pushes the provider disposable onto context.subscriptions', () => {
    activate(context as never);
    expect(context.subscriptions.length).toBeGreaterThan(0);
  });

  it('subscribes to workspace.onDidOpenTextDocument', () => {
    activate(context as never);
    expect(workspace.onDidOpenTextDocument).toHaveBeenCalledOnce();
  });

  describe('onDidOpenTextDocument routing', () => {
    it('calls openWith "visualMarkdown.editor" when defaultEditor is "webview" and file is .md', () => {
      workspace._setConfig('defaultEditor', 'webview');
      activate(context as never);

      const handler = vi.mocked(workspace.onDidOpenTextDocument).mock.calls[0][0];
      const doc = { uri: { fsPath: '/a/b.md' }, languageId: 'markdown' };
      handler(doc as never);

      expect(commands.executeCommand).toHaveBeenCalledWith(
        'vscode.openWith',
        doc.uri,
        'visualMarkdown.editor'
      );
    });

    it('does not call openWith when defaultEditor is "textEditor"', () => {
      workspace._setConfig('defaultEditor', 'textEditor');
      activate(context as never);

      const handler = vi.mocked(workspace.onDidOpenTextDocument).mock.calls[0][0];
      const doc = { uri: { fsPath: '/a/b.md' }, languageId: 'markdown' };
      handler(doc as never);

      expect(commands.executeCommand).not.toHaveBeenCalled();
    });

    it('does not call openWith for non-markdown files', () => {
      workspace._setConfig('defaultEditor', 'webview');
      activate(context as never);

      const handler = vi.mocked(workspace.onDidOpenTextDocument).mock.calls[0][0];
      const doc = { uri: { fsPath: '/a/b.ts' }, languageId: 'typescript' };
      handler(doc as never);

      expect(commands.executeCommand).not.toHaveBeenCalled();
    });
  });
});
