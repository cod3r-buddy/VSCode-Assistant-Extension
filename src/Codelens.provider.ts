import * as vscode from "vscode";

export class CodelensProvider implements vscode.CodeLensProvider {
	private codeLenses: vscode.CodeLens[] = [];
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> =
		new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> =
		this._onDidChangeCodeLenses.event;

	constructor() {
		vscode.window.onDidChangeTextEditorSelection(
			(_e: vscode.TextEditorSelectionChangeEvent) => {
				this._onDidChangeCodeLenses.fire();
			}
		);
	}

	public provideCodeLenses(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
		if (
			vscode.workspace
				.getConfiguration("codelens-sample")
				.get("enableCodeLens", true)
		) {
			this.codeLenses = [];

			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				return this.codeLenses;
			}

			const position = editor.selection;

			if (!position.isEmpty) {
				const range = new vscode.Range(
					position.anchor.line,
					position.anchor.character,
					position.active.line,
					position.active.character
				);

				this.codeLenses.push(new vscode.CodeLens(range));
			}
		}

		return this.codeLenses;
	}

	public resolveCodeLens(
		codeLens: vscode.CodeLens,
		token: vscode.CancellationToken
	) {
		if (
			vscode.workspace
				.getConfiguration("codelens-sample")
				.get("enableCodeLens", true)
		) {
			codeLens.command = {
				title: "✧˖° Explain Code",
				command: "foobar.whatsSelected",
				arguments: [],
			};
			return codeLens;
		}
		return null;
	}
}
