import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export class VisualMarkdownEditorProvider implements vscode.CustomTextEditorProvider {
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = { enableScripts: true };
    webviewPanel.webview.html = this.getWebviewContent();

    webviewPanel.webview.onDidReceiveMessage((message: { type: string }) => {
      if (message.type === 'openRaw') {
        vscode.commands.executeCommand('vscode.openWith', document.uri, 'default');
      }
    });
  }

  private getWebviewContent(): string {
    const nonce = crypto.randomBytes(16).toString('base64');
    const htmlPath = path.join(__dirname, 'webview', 'index.html');
    return fs.readFileSync(htmlPath, 'utf8').replaceAll('{{NONCE}}', nonce);
  }
}
