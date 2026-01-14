"use client";
import React from "react";
import ChatSidebar from "./components/ChatSidebar";
import ChatMain from "./components/ChatMain";
import Footer from "./components/footer";

type ResetSignal = number;

export default function ChatPage() {
	const [resetSignal, setResetSignal] = React.useState<ResetSignal>(0);
	const [selectedChatId, setSelectedChatId] = React.useState<string | null>(
		null
	);

	const handleNewChat = () => {
		setSelectedChatId(null);
		setResetSignal((value) => value + 1);
	};

	return (
		<div className="flex min-h-screen flex-col">
			<div className="flex w-full flex-1">
				<aside className="w-80 border-r border-gray-200 dark:border-gray-800">
					<ChatSidebar
						onNewChat={handleNewChat}
						onSelectChat={setSelectedChatId}
					/>
				</aside>
				<main className="flex-1">
					<ChatMain resetSignal={resetSignal} selectedChatId={selectedChatId} />
				</main>
			</div>
			<Footer />
		</div>
	);
}
