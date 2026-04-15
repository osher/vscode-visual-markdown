import { describe, it, expect, beforeEach } from 'vitest';
import { workspace } from '../__mocks__/vscode';

import { getDefaultEditor } from '../src/settings';

describe('getDefaultEditor()', () => {
  beforeEach(() => {
    workspace._clearConfig();
  });

  it('returns "webview" when config value is "webview"', () => {
    workspace._setConfig('defaultEditor', 'webview');
    expect(getDefaultEditor()).toBe('webview');
  });

  it('returns "textEditor" when config value is "textEditor"', () => {
    workspace._setConfig('defaultEditor', 'textEditor');
    expect(getDefaultEditor()).toBe('textEditor');
  });

  it('returns "webview" as fallback for an unrecognized value', () => {
    workspace._setConfig('defaultEditor', 'invalid-value');
    expect(getDefaultEditor()).toBe('webview');
  });

  it('returns "webview" as fallback when no config value is set', () => {
    // config returns undefined — default should apply
    expect(getDefaultEditor()).toBe('webview');
  });
});
