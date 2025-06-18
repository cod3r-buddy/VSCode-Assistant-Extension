import * as vscode from "vscode";
import { CodelensProvider } from "./Codelens.provider";

let disposables: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext) {
	const packageJson = context.extension.packageJSON as Record<string, unknown>;
	const id = packageJson.name;

	const saveHandler = async (name: string = "world") => {
		console.log(`Hello ${name}!!!`);
		context.secrets.store(`${id}-apiKey`, name);
		const x = await vscode.window.showInputBox({
			placeHolder: "•••••••••••••••••••••••••••••••••••••••",
			prompt:
				"Code Assistant Api Key (Press ‘Enter’ to confirm or ‘Escape’ to cancel)",
		});

		if (x) {
			context.secrets.store(`${id}-apiKey`, x);
			console.log(`Api Key Saved: ${x}`);
		}
	};

	// just for testing
	const showHandler = async () => {
		const apiKey = await context.secrets.get(`${id}-apiKey`);
		vscode.window.showInformationMessage(`Showing Api Key: ${apiKey}`);
	};

	const whatsSelectedHandler = async () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		const selection = editor.document.getText(editor.selection);
		console.log(selection);
	};

	context.subscriptions.push(
		vscode.commands.registerCommand(`${id}.saveSecret`, saveHandler),
		vscode.commands.registerCommand(`${id}.showSecret`, showHandler),
		vscode.commands.registerCommand(
			`${id}.whatsSelected`,
			whatsSelectedHandler
		),
		vscode.languages.registerCodeLensProvider("*", new CodelensProvider())
	);
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (disposables.length) {
		disposables.forEach((d) => d.dispose());
	}

	disposables = [];
}
