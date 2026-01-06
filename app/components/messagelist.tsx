"use client";
import React from "react";
import { HiOutlineChat } from "react-icons/hi";

export interface Message {
	id: string;
	role: "user" | "assistant";
	text: string;
}

interface MessageListProps {
	messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
	return (
		<ul className="space-y-4">
			{messages.map((msg) => (
				<li
					key={msg.id}
					className={`flex items-start gap-2 ${
						msg.role === "assistant" ? "bg-gray-50" : ""
					} rounded p-3`}
				>
					<span className="mt-1 text-xl text-gray-400">
						{msg.role === "assistant" ? <HiOutlineChat /> : "🧑"}
					</span>
					<div className="flex-1 whitespace-pre-line text-gray-800">
						<div>{msg.text}</div>
					</div>
				</li>
			))}
		</ul>
	);
};

export default MessageList;
