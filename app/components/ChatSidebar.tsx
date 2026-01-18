/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { HiPlus } from "react-icons/hi";
import { IChat, IMessage } from "../../interface";
import ChatItem from "./ChatItem";

const DEFAULT_CHAT: IChat = {
	topic: "Welcome",
	createDate: "welcome",
	messages: [],
};

function isValidMessage(msg: unknown): msg is IMessage {
	if (!msg || typeof msg !== "object") return false;
	const m = msg as Record<string, unknown>;
	return (
		(m.role === "user" || m.role === "assistant" || m.role === "system") &&
		typeof m.content === "string"
	);
}

type ChatWithMeta = IChat & { updateDate?: string };

function isValidChat(chat: unknown): chat is ChatWithMeta {
	if (!chat || typeof chat !== "object") return false;
	const c = chat as Record<string, unknown>;
	return (
		typeof c.topic === "string" &&
		typeof c.createDate === "string" &&
		Array.isArray(c.messages) &&
		c.messages.every(isValidMessage) &&
		(c.updateDate === undefined || typeof c.updateDate === "string")
	);
}

const STORAGE_KEY = "chatHistory";

function getSortableTime(chat: ChatWithMeta) {
	const ts = Date.parse(chat.updateDate ?? chat.createDate);
	return Number.isFinite(ts) ? ts : 0;
}

function loadChats(): ChatWithMeta[] {
	if (typeof window === "undefined") return [DEFAULT_CHAT];
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return [DEFAULT_CHAT];
	try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			const validChats = parsed.filter(isValidChat);
			if (validChats.length)
				return [...validChats].sort(
					(a, b) => getSortableTime(b) - getSortableTime(a),
				);
		}
	} catch (error) {
		console.error("Failed to load chat history", error);
	}
	return [DEFAULT_CHAT];
}

type ChatSidebarProps = {
	onNewChat?: () => void;
	onSelectChat?: (id: string) => void;
};

export default function ChatSidebar({
	onNewChat,
	onSelectChat,
}: ChatSidebarProps) {
	const [chats, setChats] = useState<ChatWithMeta[]>([DEFAULT_CHAT]);

	useEffect(() => {
		const nextChats = loadChats();
		setChats(nextChats);
	}, []);

	function handleNew() {
		onNewChat?.();
	}

	function handleSelect(chatId: string) {
		onSelectChat?.(chatId);
	}

	return (
		<div className="flex h-full flex-col gap-4 p-4 text-slate-100">
			<div className="glass-panel neon-border rounded-2xl border border-white/10 p-4 shadow-lg">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-3">
						<Image
							src="/chatIcon.jpg"
							alt="Chats"
							width={96}
							height={96}
							className="h-12 w-auto rounded-md border border-white/10 shadow"
						/>
						<div>
							<h2 className="text-lg font-semibold text-slate-50">Lulu Chat</h2>
						</div>
					</div>
					<button
						onClick={handleNew}
						className="button-primary whitespace-nowrap"
					>
						<HiPlus />
						<span className="hidden sm:inline">New Chat</span>
					</button>
				</div>
			</div>

			{chats.map((chat, i) => (
				<button
					type="button"
					key={`${chat.createDate}-${i}`}
					onClick={() => handleSelect(chat.createDate)}
					className="block w-full text-left transition hover:translate-x-1"
				>
					<ChatItem title={chat.topic || "Untitled"} />
				</button>
			))}
		</div>
	);
}
