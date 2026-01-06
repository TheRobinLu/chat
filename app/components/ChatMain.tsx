"use client";

import * as React from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface Message {
	id?: string;
	role: "user" | "assistant";
	content: string;
}

export default function ChatMain() {
	const [messages, setMessages] = React.useState<Message[]>([]);
	const [input, setInput] = React.useState("");
	const [isLoading, setIsLoading] = React.useState(false);
	const [searching, setSearching] = React.useState(false);
	const [thinking, setThinking] = React.useState(false);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;
		const userMsg: Message = {
			role: "user",
			content: input,
		};
		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setIsLoading(true);

		const res = await fetch("/api/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				messages: [...messages, userMsg],
				searching,
				thinking,
			}),
		});
		if (!res.body) {
			setIsLoading(false);
			return;
		}

		const reader = res.body.getReader();
		let assistantMsg: Message = { role: "assistant", content: "" };
		setMessages((prev) => [...prev, assistantMsg]);
		let done = false;
		while (!done) {
			const { value, done: doneReading } = await reader.read();
			done = doneReading;
			const chunk = value ? new TextDecoder().decode(value) : "";
			if (chunk) {
				const chunkMath = chunk
					.replace(/\\\[/g, "$$")
					.replace(/\\\]/g, "$$")
					.replace(/\\\(/g, "$")
					.replace(/\\\)/g, "$");
				assistantMsg = {
					...assistantMsg,
					content: assistantMsg.content + chunkMath,
				};
				setMessages((prev) => {
					const updated = [...prev];
					updated[updated.length - 1] = assistantMsg;
					return updated;
				});
			}
		}
		setIsLoading(false);
	};

	return (
		<div className="flex h-screen flex-col">
			<div className="flex items-center justify-between border-b border-gray-200 p-4">
				<div className="flex items-center gap-3">
					<h3 className="text-lg font-semibold">Chat</h3>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4">
				<div className="space-y-3">
					{messages.map((msg, idx) => (
						<div
							key={msg.id || idx}
							className={msg.role === "user" ? "text-right" : "text-left"}
						>
							<div
								className={
									msg.role === "user"
										? "inline-block rounded bg-blue-500 px-3 py-2 text-white"
										: "inline-block rounded bg-gray-200 px-3 py-2 text-gray-900"
								}
							>
								{
									<ReactMarkdown
										remarkPlugins={[remarkGfm, remarkMath]}
										rehypePlugins={[rehypeKatex]}
									>
										{msg.content}
									</ReactMarkdown>
								}
							</div>
						</div>
					))}
					{isLoading && (
						<div className="text-left">
							<span className="inline-block rounded bg-gray-200 px-3 py-2 text-gray-900 animate-pulse">
								...
							</span>
						</div>
					)}
				</div>
			</div>

			<form onSubmit={handleSubmit} className="border-t p-4">
				<div className="flex gap-2">
					<input
						value={input}
						onChange={handleInputChange}
						className="flex-1 rounded border px-3 py-2"
						placeholder="Type a message"
						disabled={isLoading}
					/>
					<button
						type="submit"
						className="rounded bg-black/90 px-4 py-2 text-white"
						disabled={isLoading}
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
			</form>
		</div>
	);
}
