"use client";
import React from "react";
import ChatSidebar from "./components/ChatSidebar";
import ChatMain from "./components/ChatMain";

type ResetSignal = number;

export default function ChatPage() {
	const [resetSignal, setResetSignal] = React.useState<ResetSignal>(0);

	const handleNewChat = () => {
		setResetSignal((value) => value + 1);
	};

	return (
		<div className="flex w-full">
			<aside className="w-80 border-r border-gray-200 dark:border-gray-800">
				<ChatSidebar onNewChat={handleNewChat} />
			</aside>
			<main className="flex-1">
				<ChatMain resetSignal={resetSignal} />
			</main>
		</div>
	);
}
