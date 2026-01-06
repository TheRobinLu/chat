"use client";
import React, { useState } from "react";
import { HiPlus } from "react-icons/hi";
import ChatItem from "./ChatItem";

export default function ChatSidebar() {
	const [chats, setChats] = useState<string[]>(["Welcome"]);

	function handleNew() {
		setChats((s) => ["New chat", ...s]);
	}

	return (
		<div className="flex h-screen flex-col p-4">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold">Chats</h2>
				<button
					onClick={handleNew}
					className="flex items-center gap-2 rounded bg-black/90 px-3 py-2 text-white"
				>
					<HiPlus />
					New Chat
				</button>
			</div>

			<div className="flex-1 overflow-auto space-y-2">
				{chats.map((c, i) => (
					<ChatItem key={`${c}-${i}`} title={c} />
				))}
			</div>
		</div>
	);
}
