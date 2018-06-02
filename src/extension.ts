import * as stripComments from 'strip-json-comments';

import {
  ExtensionContext,
  Position,
  Range,
  TextEditorDecorationType,
  window,
  commands
} from 'vscode';

import * as vscode from 'vscode';
import * as jsonlint from 'jsonlint';

const LINE_SEPERATOR = /\n|\r\n/;

// TODO: make this configurable.
const DEFAULT_JSON_SPACE = 4; 

/**
 */
function removeEscapedChars(rawJSON: string) {
	return rawJSON.replace(/\\n/g, (match, offset, string) => {
		return '';
	}).replace(/\\"/g, (match, offset, string) => {
		return '"';
	});
}

/**
 */
function getActiveEditorContents(): string {
	const editor = window.activeTextEditor;

    if (!editor) {
      throw new Error('could not get active text editor');
    }

    return editor.document.getText();
}

/**
 * 
 * @param editor 
 * @param contents 
 */
function replaceEditorContents(editor, contents: string) {
	editor.edit(builder => {
		const start = new Position(0, 0);
		const lines = contents.split(LINE_SEPERATOR);
		const end = new Position(lines.length, lines[lines.length - 1].length);
		const allRange = new Range(start, end);
		builder.replace(allRange, contents);
	}).then(success => {
		// TODO: unselect the text
	});
}

export function activate(context: ExtensionContext) {
  let disposable = commands.registerCommand('extension.prettifyJSON', () => {

	const raw = getActiveEditorContents();

    const json = jsonlint.parse(stripComments(raw));

    const pretty = JSON.stringify(json, null, DEFAULT_JSON_SPACE);

	replaceEditorContents(window.activeTextEditor, pretty);

  });

  context.subscriptions.push(disposable);

  let escapedDisposable = commands.registerCommand('extension.prettifyEscapedJSON', () => {
	
	const raw = getActiveEditorContents();

	const cleanedRAW = removeEscapedChars(raw);

	const json = jsonlint.parse(stripComments(cleanedRAW));

	const pretty = JSON.stringify(json, null, DEFAULT_JSON_SPACE);
	
	replaceEditorContents(window.activeTextEditor, pretty);

  });

  context.subscriptions.push(escapedDisposable);
}