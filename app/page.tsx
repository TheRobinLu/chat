"use client";
import React from "react";
import ChatSidebar from "../components/ChatSidebar";
import ChatMain from "../components/ChatMain";

export default function ChatPage() {
	return (
		<div className="flex w-full">
			<aside className="w-80 border-r border-gray-200 dark:border-gray-800">
				<ChatSidebar />
			</aside>
			<main className="flex-1">
				<ChatMain />
			</main>
		</div>
	);
}
