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
		<div className="relative flex min-h-screen flex-col overflow-hidden">
			<div
				className="pointer-events-none absolute inset-0 opacity-50"
				aria-hidden
			>
				<div className="hero-accent absolute inset-0 blur-3xl" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(78,161,255,0.12),transparent_40%),radial-gradient(circle_at_90%_10%,rgba(76,230,200,0.12),transparent_32%)]" />
			</div>
			<div className="relative z-10 flex w-full flex-1">
				<aside className="glass-panel neon-border hidden w-80 shrink-0 border border-white/10 lg:flex">
					<ChatSidebar
						onNewChat={handleNewChat}
						onSelectChat={handleSelectChat}
					/>
				</aside>

				{isSidebarOpen && (
					<div
						className="fixed inset-0 z-40 flex backdrop-blur-sm lg:hidden"
						onClick={closeSidebar}
					>
						<div className="absolute inset-0 bg-black/70" />
						<aside
							className="relative z-50 h-full w-72 max-w-[85vw] glass-strong neon-border"
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
