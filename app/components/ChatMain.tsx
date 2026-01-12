"use client";

import * as React from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { IChat, IMessage } from "@/interface";

type ChatMainProps = {
	resetSignal: number;
};

type ChatHistoryPayload = IChat[];

const STORAGE_KEY = "chatHistory";

export default function ChatMain({ resetSignal }: ChatMainProps) {
	const [messages, setMessages] = React.useState<IMessage[]>([]);
	const [input, setInput] = React.useState("");
	const [isLoading, setIsLoading] = React.useState(false);
	const [searching, setSearching] = React.useState(false);
	const [thinking, setThinking] = React.useState(false);
	const [chat, setChat] = React.useState<IChat | null>(null);
	const [chatTopic, setChatTopic] = React.useState("New Chat");
	const [chatHistory, setChatHistory] = React.useState<ChatHistoryPayload>([]);

	const upsertChatHistory = React.useCallback((updatedChat: IChat) => {
		setChat(updatedChat);
		setChatHistory((prev) => {
			const idx = prev.findIndex(
				(c) => c.createDate === updatedChat.createDate
			);
			if (idx === -1) return [...prev, updatedChat];
			const next = [...prev];
			next[idx] = updatedChat;
			return next;
		});
	}, []);

	React.useEffect(() => {
		setChatTopic("New Chat");
		const stored = localStorage.getItem(STORAGE_KEY);

		if (!stored) return;
		try {
			const parsed: ChatHistoryPayload = JSON.parse(stored) ?? [];
			setChatHistory(parsed);
			const latest = parsed[parsed.length - 1];
			if (latest) {
				setChat(latest);
				setMessages(latest.messages ?? []);
			}
		} catch {}
	}, []);

	React.useEffect(() => {
		setMessages([]);
		setInput("");
		setIsLoading(false);
		setSearching(false);
		setThinking(false);
		setChat(null);
		setChatHistory([]);
	}, [resetSignal]);

	React.useEffect(() => {
		if (chatHistory.length === 0) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
	}, [chatHistory]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;
		const userMsg: IMessage = {
			role: "user",
			content: input,
		};
		const messageHistory = [...messages, userMsg];

		// if (messages.length === 0) {
		// 	const sysMsg: IMessage = {
		// 		role: "system",
		// 		content:
		// 			"You are a helpful AI assistant. generate a topic to this conversation " +
		// 			" with formated as 'Topic: <topic>'.\n\n",
		// 	};
		// 	setMessages([sysMsg]);
		// }

		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setIsLoading(true);

		const res = await fetch("/api/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				messages: messageHistory,
				searching,
				thinking,
			}),
		});
		if (!res.body) {
			setIsLoading(false);
			return;
		}

		const reader = res.body.getReader();
		let assistantMsg: IMessage = { role: "assistant", content: "" };
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
		const updatedMessages = [...messageHistory, assistantMsg];
		const createDate = chat?.createDate ?? new Date().toISOString();

		if (messages.length === 0) {
			const topicPrompt = `${userMsg.content}\n${assistantMsg.content}\n\nPlease generate a topic to this conversation with formatted as 'Topic: <topic>'.`;
			const resTopic = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: [{ role: "user", content: topicPrompt }],
					searching: false,
					thinking: false,
				}),
			});
			let topicText = "New Chat1";
			if (resTopic.ok) {
				const topicChunk = await resTopic.text();
				const topicMatch = topicChunk.match(/Topic:\s*(.+)/);
				topicText = topicMatch ? topicMatch[1].trim() : topicText;
			}
			setChatTopic(topicText);
			const newChat: IChat = {
				topic: topicText,
				createDate,
				messages: updatedMessages,
			};
			upsertChatHistory(newChat);
		} else {
			const topicText = chat?.topic ?? chatTopic;
			setChatTopic(topicText);
			const updatedChat: IChat = {
				topic: topicText,
				createDate,
				messages: updatedMessages,
			};
			upsertChatHistory(updatedChat);
		}

		setIsLoading(false);
	};

	return (
		<div className="flex h-screen flex-col">
			<div className="flex items-center justify-between border-b border-gray-200 p-4">
				<div className="flex items-center gap-3">
					<h3 className="text-lg font-semibold">{chatTopic}</h3>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4">
				<div className="space-y-3">
					{messages
						.filter((msg) => msg.role !== "system")
						.map((msg, idx) => (
							<div
								key={idx}
								className={msg.role === "user" ? "text-right" : "text-left"}
							>
								<div
									className={
										msg.role === "user"
											? "inline-block rounded bg-blue-500 px-3 py-2 text-white"
											: "inline-block rounded bg-gray-200 px-3 py-2 text-gray-900"
									}
								>
									<ReactMarkdown
										remarkPlugins={[remarkGfm, remarkMath]}
										rehypePlugins={[rehypeKatex]}
									>
										{msg.content}
									</ReactMarkdown>
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
