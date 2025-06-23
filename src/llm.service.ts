import { Method } from "./consts";

class LLM {
	static async sampleTextStreaming(...args: any[]) {
		console.log(...args);

		const baseUrl = "http://localhost:8080";
		return await fetch(`${baseUrl}/stream`, {
			method: Method.GET,
		});
	}
}

export default LLM;
