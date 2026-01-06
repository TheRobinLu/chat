import { DS_MODEL, DS_API_URL, DS_REASONER_MODEL } from "@/const";

export const runtime = "edge";

interface ChatMessage {
	role: "system" | "user" | "assistant" | string;
	content: string;
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const messages: ChatMessage[] = body.messages || [];
		const thinking = body.thinking || false;
		let model = DS_MODEL || "deepseek-chat";

		const upstreamBase = (DS_API_URL || "https://api.deepseek.com").replace(
			/\/+$/,
			""
		);

		if (thinking) {
			model = DS_REASONER_MODEL || "deepseek-reasoner";
		}

		const upstreamUrl = `${upstreamBase}/v1/chat/completions`;

		const upstreamRes = await fetch(upstreamUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.DS_API_KEY || ""}`,
			},
			body: JSON.stringify({
				model: model,
				messages,
				stream: true,
			}),
		});

		if (!upstreamRes.ok || !upstreamRes.body) {
			const text = await upstreamRes.text().catch(() => "");
			return new Response(`Upstream error: ${upstreamRes.status} ${text}`, {
				status: 502,
			});
		}

		const stream = new ReadableStream({
			async start(controller) {
				const reader = upstreamRes.body!.getReader();
				const decoder = new TextDecoder();
				let buf = "";

				try {
					while (true) {
						const { value, done } = await reader.read();
						if (done) break;
						buf += decoder.decode(value, { stream: true });

						const lines = buf.split(/\r\n|\n/);
						// keep last partial line in buffer
						buf = lines.pop() || "";

						for (const line of lines) {
							const trimmed = line.trim();
							if (!trimmed) continue;
							// SSE-style: "data: {...}"
							if (trimmed.startsWith("data:")) {
								const payload = trimmed.slice(5).trim();
								if (payload === "[DONE]") {
									continue;
								}
								try {
									const parsed = JSON.parse(payload);
									// DeepSeek/OpenAI-style delta
									const delta = parsed.choices?.[0]?.delta;
									const textChunk =
										delta?.content ??
										parsed.choices?.[0]?.text ??
										parsed.choices?.[0]?.message?.content ??
										"";
									if (textChunk) {
										const enc = new TextEncoder();
										controller.enqueue(enc.encode(textChunk));
									}
								} catch (err) {
									// if payload is not JSON, forward raw
									const enc = new TextEncoder();
									controller.enqueue(enc.encode(payload));
								}
							} else {
								// non-SSE line: try to parse JSON or forward text
								try {
									const parsed = JSON.parse(trimmed);
									const delta = parsed.choices?.[0]?.delta;
									const textChunk =
										delta?.content ??
										parsed.choices?.[0]?.text ??
										parsed.choices?.[0]?.message?.content ??
										"";
									if (textChunk) {
										const enc = new TextEncoder();
										controller.enqueue(enc.encode(textChunk));
									}
								} catch {
									const enc = new TextEncoder();
									controller.enqueue(enc.encode(trimmed));
								}
							}
						}
					}
				} catch (err) {
					// upstream read error
					controller.error(err);
					return;
				} finally {
					controller.close();
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "no-cache",
			},
		});
	} catch (err) {
		return new Response("Connection error.", { status: 500 });
	}
}
