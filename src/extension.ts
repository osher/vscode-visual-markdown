import * as vscode from 'vscode';
import { VisualMarkdownEditorProvider } from './VisualMarkdownEditorProvider';
import { getDefaultEditor } from './settings';

export function activate(context: vscode.ExtensionContext): void {
  const provider = new VisualMarkdownEditorProvider();

  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      'visualMarkdown.editor',
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
      if (document.languageId !== 'markdown') {
        return;
      }
      if (getDefaultEditor() === 'webview') {
        vscode.commands.executeCommand('vscode.openWith', document.uri, 'visualMarkdown.editor');
      }
    })
  );
}

export function deactivate(): void {
  // nothing to clean up
}
