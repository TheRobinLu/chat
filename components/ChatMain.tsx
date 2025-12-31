"use client";
import React, { useState } from "react";

export default function ChatMain() {
	const [messages, setMessages] = useState<
		{ id: string; role: string; text: string }[]
	>([{ id: "1", role: "assistant", text: "Hello — ask me anything." }]);
	const [thinking, setThinking] = useState(false);
	const [searching, setSearching] = useState(false);
	const [query, setQuery] = useState("");

	async function send() {
		if (!query.trim()) return;
		const userId = String(Date.now());
		setMessages((m) => [...m, { id: userId, role: "user", text: query }]);
		setQuery("");
		setThinking(true);

		try {
			const res = await fetch(`/api/chat`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt: query }),
			});

			if (!res.body) throw new Error("No body in response");

			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			const assistantId = String(Date.now());
			setMessages((m) => [
				...m,
				{ id: assistantId, role: "assistant", text: "" },
			]);

			let done = false;
			while (!done) {
				const { value, done: d } = await reader.read();
				done = d;
				if (value) {
					const text = decoder.decode(value);
					setMessages((m) =>
						m.map((msg) =>
							msg.id === assistantId ? { ...msg, text: msg.text + text } : msg
						)
					);
				}
			}
		} catch (e) {
			setMessages((m) => [
				...m,
				{
					id: String(Date.now()),
					role: "assistant",
					text: "Error: could not reach API",
				},
			]);
		} finally {
			setThinking(false);
		}
	}

	return (
		<div className="flex h-screen flex-col">
			<div className="flex items-center justify-between border-b border-gray-200 p-4">
				<div className="flex items-center gap-3">
					<h3 className="text-lg font-semibold">Chat</h3>
				</div>
			</div>

			<div className="border-t p-4">
				<div className="flex gap-2">
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="flex-1 rounded border px-3 py-2"
						placeholder="Type a message"
					/>
					<button
						onClick={send}
						className="rounded bg-black/90 px-4 py-2 text-white"
					>
						Send
					</button>
				</div>
				<div className="mt-3 flex gap-2">
					<button
						type="button"
						onClick={() => setSearching((v) => !v)}
						className={`rounded px-4 py-2 text-white transition-colors ${
							searching
								? "bg-blue-600 hover:bg-blue-700"
								: "bg-gray-300 text-gray-700 hover:bg-blue-500 hover:text-white"
						}`}
					>
						Search
					</button>
					<button
						type="button"
						onClick={() => setThinking((v) => !v)}
						className={`rounded px-4 py-2 text-white transition-colors ${
							thinking
								? "bg-green-600 hover:bg-green-700"
								: "bg-gray-300 text-gray-700 hover:bg-green-500 hover:text-white"
						}`}
					>
						Thinking
					</button>
				</div>
			</div>
		</div>
	);
}
