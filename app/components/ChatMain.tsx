"use client";

import * as React from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { HiMenuAlt2, HiSearch, HiLightningBolt } from "react-icons/hi";
import { IChat, IMessage } from "@/interface";

type ChatMainProps = {
	resetSignal: number;
	selectedChatId: string | null;
	onOpenSidebar?: () => void;
};

type ChatHistoryPayload = (IChat & { updateDate?: string })[];

const STORAGE_KEY = "chatHistory";

export default function ChatMain({
	resetSignal,
	selectedChatId,
	onOpenSidebar,
}: ChatMainProps) {
	const [messages, setMessages] = React.useState<IMessage[]>([]);
	const [input, setInput] = React.useState("");
	const [isLoading, setIsLoading] = React.useState(false);
	const [searching, setSearching] = React.useState(false);
	const [thinking, setThinking] = React.useState(false);
	const [chat, setChat] = React.useState<IChat | null>(null);
	const [chatTopic, setChatTopic] = React.useState("");
	const [chatHistory, setChatHistory] = React.useState<ChatHistoryPayload>([]);

	const upsertChatHistory = React.useCallback((updatedChat: IChat) => {
		const stampedChat: IChat & { updateDate: string } = {
			...updatedChat,
			updateDate: new Date().toISOString(),
		};
		setChat(stampedChat);
		setChatHistory((prev) => {
			const idx = prev.findIndex(
				(c) => c.createDate === stampedChat.createDate,
			);
			if (idx === -1) return [...prev, stampedChat];
			const next = [...prev];
			next[idx] = stampedChat;
			return next;
		});
	}, []);

	React.useEffect(() => {
		setChatTopic("");
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return;
		try {
			const parsed: ChatHistoryPayload = JSON.parse(stored) ?? [];
			setChatHistory(parsed);
			const latest = parsed[parsed.length - 1];
			if (latest) {
				setChat(latest);
				setChatTopic(latest.topic ?? "New Chat");
				setMessages(latest.messages ?? []);
			}
		} catch {}
	}, []);

	React.useEffect(() => {
		if (!selectedChatId) return;
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return;
		try {
			const parsed: ChatHistoryPayload = JSON.parse(stored) ?? [];
			setChatHistory(parsed);
			const target = parsed.find((c) => c.createDate === selectedChatId);
			if (target) {
				setChat(target);
				setChatTopic(target.topic ?? "New Chat");
				setMessages(target.messages ?? []);
			}
		} catch {}
	}, [selectedChatId]);

	React.useEffect(() => {
		setMessages([]);
		setInput("");
		setIsLoading(false);
		setSearching(false);
		setThinking(false);
		setChat(null);
		setChatTopic("");
		// keep chatHistory so past chats remain selectable
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
				updateDate: createDate,
				messages: updatedMessages,
			};
			upsertChatHistory(newChat);
		} else {
			const topicText = chat?.topic ?? chatTopic;
			setChatTopic(topicText);
			const updatedChat: IChat = {
				topic: topicText,
				createDate,
				updateDate: new Date().toISOString(),
				messages: updatedMessages,
			};
			upsertChatHistory(updatedChat);
		}

		setIsLoading(false);
	};

	return (
		<div className="flex h-full min-h-[70vh] flex-col px-2 lg:px-3">
			<div className="glass-strong neon-border flex h-full flex-col rounded-xl border border-white/16">
				<div className="flex items-start justify-between border-b border-white/12 bg-white/10 px-4 py-4 lg:px-6">
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => onOpenSidebar?.()}
							className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-100 shadow-sm transition hover:border-white/40 hover:bg-white/20 lg:hidden"
						>
							<HiMenuAlt2 className="h-5 w-5" />
							<span className="sr-only">Open chats</span>
						</button>
						<div>
							<h3 className="text-xl font-semibold text-slate-50">
								{chatTopic || "New Transmission"}
							</h3>
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-1">
						<button
							type="button"
							onClick={() => setSearching((v) => !v)}
							className={`pill-toggle ${searching ? "is-active" : ""}`}
						>
							<HiSearch className="h-4 w-4" />
							<span>Search</span>
						</button>
						<button
							type="button"
							onClick={() => setThinking((v) => !v)}
							className={`pill-toggle ${thinking ? "is-active" : ""}`}
						>
							<HiLightningBolt className="h-4 w-4" />
							<span>Thinking</span>
						</button>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-2">
					<div className="mx-auto w-full space-y-4">
						{messages
							.filter((msg) => msg.role !== "system")
							.map((msg, idx) => (
								<div
									key={idx}
									className={
										msg.role === "user"
											? "flex justify-end"
											: "flex justify-start"
									}
								>
									<div
										className={`max-w-full rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm backdrop-blur ${
											msg.role === "user"
												? "message-user text-slate-50"
												: "message-assistant text-slate-100"
										}`}
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
							<div className="flex justify-start">
								<span className="message-assistant inline-block rounded-2xl px-4 py-3 text-sm text-slate-100 animate-pulse">
									Generating...
								</span>
							</div>
						)}
					</div>
				</div>

				<form
					onSubmit={handleSubmit}
					className="border-t border-white/12 bg-white/10 px-4 py-5 backdrop-blur lg:px-8"
				>
					<div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row">
						<input
							value={input}
							onChange={handleInputChange}
							className="input-cyber"
							placeholder="Type a message to the alloy core..."
							disabled={isLoading}
						/>
						<button
							type="submit"
							className="button-primary min-w-[120px] disabled:cursor-not-allowed disabled:opacity-70"
							disabled={isLoading}
						>
							Send
						</button>
					</div>
					<div className="mx-auto mt-3 flex w-full max-w-3xl flex-wrap gap-2">
						{searching && (
							<span className="pill-toggle is-active">
								<HiSearch className="h-4 w-4" />
								<span>Search mode</span>
							</span>
						)}
						{thinking && (
							<span className="pill-toggle is-active">
								<HiLightningBolt className="h-4 w-4" />
								<span>Thinking</span>
							</span>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}
