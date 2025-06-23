import * as vscode from "vscode";

import { CodelensProvider } from "./Codelens.provider";
import LLM from "./llm.service";
import Timer from "./utils/timer";
import {
	getApiKey,
	getEditorLanguageId,
	getSelectionText,
} from "./utils/vscode";

let disposables: vscode.Disposable[] = [];

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const id = "cod3r-buddy";

	const handler: vscode.ChatRequestHandler = async (
		request,
		_ctx,
		stream,
		_token
	) => {
		if (request.command === "explain") {
			const underliedCode = getSelectionText();
			const langId = getEditorLanguageId();

			stream.progress(
				"We are working on your response, in the meantime you can drink a bit of coffee ☕ idk..."
			);

			await Timer.wait(3000);

			const apiKey = await getApiKey(context);

			if (!apiKey) {
				stream.markdown(
					"Uh ou! Looks like you forgot to include your `apiKey`, which is essential for generating responses. No worries though, just add it in and give it another go, I'll be right here, ready when you are 😉\n"
				);

				stream.button({
					title: "Provide LLM API Key",
					command: `${id}.activate`,
				});
				return;
			}

			stream.markdown(`\`\`\`${langId}\n${underliedCode}\n\`\`\`\n`);
			stream.markdown(`Ty for the context, let's cook 🍳 something now!\n\n`);

			stream.markdown("---\n");

			const response = await LLM.sampleTextStreaming({
				context: underliedCode,
				languageId: langId,
				apiKey,
			});

			const reader = response
				.body!.pipeThrough(new TextDecoderStream())
				.getReader();

			let data = "";

			while (true) {
				const { value: token, done } = await reader.read();
				if (done) {
					break;
				}

				stream.markdown(token);
				data += token;
			}

			return;
		}

		// unfortunately, there are no other scenarios supported yet
	};

	const coderBuddy = vscode.chat.createChatParticipant(
		"chat.cod3r-buddy",
		handler
	);
	coderBuddy.iconPath = vscode.Uri.joinPath(
		context.extensionUri,
		"assets",
		"avatar.png"
	);

	// I'm didn't get any deeper in this feature, so don't pay attention here
	coderBuddy.followupProvider = {
		provideFollowups(result, context, token) {
			if (result.metadata?.command === "explainCode") {
				return [
					{
						prompt: "Do you want to generate a comment documentation?",
						label: vscode.l10n.t("Generate Documentation"),
					} satisfies vscode.ChatFollowup,
				];
			}
		},
	};

	const activateHandler = async () => {
		const defaultValue = (await context.secrets.get(`${id}-apiKey`)) || "";
		const apiKey = await vscode.window.showInputBox({
			placeHolder: "•••••••••••••••••••••••••••••••••••••••",
			value: defaultValue,
			password: true,
			prompt:
				"Code Assistant Api Key (Press ‘Enter’ to confirm or ‘Escape’ to cancel)",
		});

		context.secrets.store(`${id}-apiKey`, apiKey || "");
		vscode.workspace.getConfiguration(id).update("enable", true);
	};

	const toggleHandler = async () => {
		const enabled: boolean = vscode.workspace
			.getConfiguration(id)
			.get("enable", false);

		vscode.workspace.getConfiguration(id).update("enable", !enabled);
	};

	const explainCodeHandler = async () => {
		vscode.commands.executeCommand(
			"workbench.action.openQuickChat",
			"@coder-buddy /explain"
		);
	};

	context.subscriptions.push(
		vscode.commands.registerCommand(`${id}.explainCode`, explainCodeHandler),
		vscode.commands.registerCommand(`${id}.activate`, activateHandler),
		vscode.commands.registerCommand(`${id}.toggle`, toggleHandler),
		vscode.languages.registerCodeLensProvider("*", new CodelensProvider()),
		coderBuddy
	);
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (disposables.length) {
		disposables.forEach((d) => d.dispose());
	}

	disposables = [];
}
