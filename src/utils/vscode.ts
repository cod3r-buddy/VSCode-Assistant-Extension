import * as vscode from "vscode";

export const getSelectionText = () => {
	const editor = vscode.window.activeTextEditor;

	if (!editor) {
		return;
	}

	return editor.document.getText(editor.selection);
};

export const getEditorLanguageId = () => {
	const editor = vscode.window.activeTextEditor;

	if (!editor) {
		return;
	}

	return editor.document.languageId;
};

export const getApiKey = async (ctx: vscode.ExtensionContext) => {
	const inspected = vscode.workspace
		.getConfiguration("cod3r-buddy")
		.inspect("LLMApiKey");

	if (inspected?.globalValue) {
		console.log("global one");
		return inspected.globalValue;
	}

	const secretApiKey = await ctx.secrets.get("cod3r-buddy-apiKey");

	if (secretApiKey) {
		console.log("secret one");
		return secretApiKey;
	}

	return undefined;
};
