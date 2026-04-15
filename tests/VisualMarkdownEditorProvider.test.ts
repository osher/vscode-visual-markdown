import { describe, it, expect, vi, beforeEach } from 'vitest';
import { commands, makeWebviewPanel } from '../__mocks__/vscode';

// Import after mock is aliased via vitest.config.ts
import { VisualMarkdownEditorProvider } from '../src/VisualMarkdownEditorProvider';

const makeDocument = (uri = { fsPath: '/test/file.md', toString: () => '/test/file.md' }) => ({
  uri,
  getText: vi.fn(() => '# Hello'),
});

describe('VisualMarkdownEditorProvider', () => {
  let panel: ReturnType<typeof makeWebviewPanel>;
  let document: ReturnType<typeof makeDocument>;

  beforeEach(() => {
    vi.clearAllMocks();
    panel = makeWebviewPanel();
    document = makeDocument();
  });

  describe('resolveCustomTextEditor', () => {
    it('sets webviewPanel.webview.html to a non-empty string', async () => {
      const provider = new VisualMarkdownEditorProvider();
      await provider.resolveCustomTextEditor(
        document as never,
        panel as never,
        {} as never
      );
      expect(panel.webview.html).toBeTruthy();
      expect(typeof panel.webview.html).toBe('string');
    });

    it('enables scripts on the webview', async () => {
      const provider = new VisualMarkdownEditorProvider();
      await provider.resolveCustomTextEditor(
        document as never,
        panel as never,
        {} as never
      );
      expect(panel.webview.options.enableScripts).toBe(true);
    });

    it('renders a button with data-action="open-raw" in the webview HTML', async () => {
      const provider = new VisualMarkdownEditorProvider();
      await provider.resolveCustomTextEditor(
        document as never,
        panel as never,
        {} as never
      );
      expect(panel.webview.html).toContain('data-action="open-raw"');
    });

    it('registers an onDidReceiveMessage handler', async () => {
      const provider = new VisualMarkdownEditorProvider();
      await provider.resolveCustomTextEditor(
        document as never,
        panel as never,
        {} as never
      );
      expect(panel.webview.onDidReceiveMessage).toHaveBeenCalledOnce();
    });
  });

  describe('onDidReceiveMessage — openRaw', () => {
    it('calls vscode.openWith with "default" when message type is "openRaw"', async () => {
      const provider = new VisualMarkdownEditorProvider();
      await provider.resolveCustomTextEditor(
        document as never,
        panel as never,
        {} as never
      );
      // Fire the message from the webview
      (panel.webview as never)._fireMessage({ type: 'openRaw' });
      expect(commands.executeCommand).toHaveBeenCalledWith(
        'vscode.openWith',
        document.uri,
        'default'
      );
    });

    it('does not call executeCommand for unknown message types', async () => {
      const provider = new VisualMarkdownEditorProvider();
      await provider.resolveCustomTextEditor(
        document as never,
        panel as never,
        {} as never
      );
      (panel.webview as never)._fireMessage({ type: 'unknownMessage' });
      expect(commands.executeCommand).not.toHaveBeenCalled();
    });
  });
});
