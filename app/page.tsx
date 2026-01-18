"use client";
import React from "react";
import ChatSidebar from "./components/ChatSidebar";
import ChatMain from "./components/ChatMain";
import Footer from "./components/footer";

type ResetSignal = number;

export default function ChatPage() {
	const [resetSignal, setResetSignal] = React.useState<ResetSignal>(0);
	const [selectedChatId, setSelectedChatId] = React.useState<string | null>(
		null,
	);
	const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

	const handleNewChat = () => {
		setSelectedChatId(null);
		setResetSignal((value) => value + 1);
		setIsSidebarOpen(false);
	};

	const handleSelectChat = (chatId: string | null) => {
		setSelectedChatId(chatId);
		setIsSidebarOpen(false);
	};

	const openSidebar = () => setIsSidebarOpen(true);
	const closeSidebar = () => setIsSidebarOpen(false);

	return (
		<div className="flex min-h-screen flex-col bg-gray-50">
			<div className="relative flex w-full flex-1">
				<aside className="hidden w-80 shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 lg:flex">
					<ChatSidebar
						onNewChat={handleNewChat}
						onSelectChat={handleSelectChat}
					/>
				</aside>

				{isSidebarOpen && (
					<div
						className="fixed inset-0 z-40 flex lg:hidden"
						onClick={closeSidebar}
					>
						<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
						<aside
							className="relative z-50 h-full w-72 max-w-[85vw] border-r border-gray-200 bg-white shadow-xl"
							onClick={(e) => e.stopPropagation()}
						>
							<ChatSidebar
								onNewChat={handleNewChat}
								onSelectChat={handleSelectChat}
							/>
						</aside>
					</div>
				)}

				<main className="flex-1">
					<ChatMain
						resetSignal={resetSignal}
						selectedChatId={selectedChatId}
						onOpenSidebar={openSidebar}
					/>
				</main>
			</div>
			<Footer />
		</div>
	);
}
