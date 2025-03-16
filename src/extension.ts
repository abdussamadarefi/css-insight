import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
const bootstrapClasses = require('./bootstrap-classes.json');

export function activate(context: vscode.ExtensionContext) {
  console.log('CSS Insight extension is active.');
  const hoverProvider = vscode.languages.registerHoverProvider(
    ['html', 'javascript', 'javascriptreact', 'typescript', 'typescriptreact'],
    {
      provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position, /[a-zA-Z0-9_-]+/);
        if (!range) return;
        const word = document.getText(range);
        if (bootstrapClasses[word]) {
          return new vscode.Hover(bootstrapClasses[word]);
        }
      }
    }
  );
  context.subscriptions.push(hoverProvider);
}

export function deactivate() {}
