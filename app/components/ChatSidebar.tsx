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

function isValidChat(chat: unknown): chat is IChat {
	if (!chat || typeof chat !== "object") return false;
	const c = chat as Record<string, unknown>;
	return (
		typeof c.topic === "string" &&
		typeof c.createDate === "string" &&
		Array.isArray(c.messages) &&
		c.messages.every(isValidMessage)
	);
}

type ChatSidebarProps = {
	onNewChat?: () => void;
};

const STORAGE_KEY = "chatHistory";

function loadChats(): IChat[] {
	if (typeof window === "undefined") return [DEFAULT_CHAT];
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return [DEFAULT_CHAT];
	try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			const validChats = parsed.filter(isValidChat);
			if (validChats.length) return validChats;
		}
	} catch (error) {
		console.error("Failed to load chat history", error);
	}
	return [DEFAULT_CHAT];
}

export default function ChatSidebar({ onNewChat }: ChatSidebarProps) {
	const [chats, setChats] = useState<IChat[]>([DEFAULT_CHAT]);

	useEffect(() => {
		const nextChats = loadChats();
		setChats(nextChats);
	}, []);

	function handleNew() {
		onNewChat?.();
	}

	return (
		<div className="flex h-screen flex-col p-4">
			<div className="mb-4 flex items-center justify-between">
				<Image
					src="/chaticon.jpg"
					alt="Chats"
					width={96}
					height={96}
					className="h-12 w-auto rounded"
				/>
				<button
					onClick={handleNew}
					className="flex items-center gap-2 rounded bg-black/90 px-3 py-2 text-white"
				>
					<HiPlus />
					New Chat
				</button>
			</div>

			<div className="flex-1 overflow-auto space-y-2">
				{chats.map((chat, i) => (
					<ChatItem
						key={`${chat.createDate}-${i}`}
						title={chat.topic || "Untitled"}
					/>
				))}
			</div>
		</div>
	);
}
