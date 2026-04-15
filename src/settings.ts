import * as vscode from 'vscode';

export function getDefaultEditor(): 'webview' | 'textEditor' {
  const value = vscode.workspace
    .getConfiguration('visualMarkdown')
    .get<string>('defaultEditor');

  if (value === 'textEditor') {
    return 'textEditor';
  }
  return 'webview';
}
