import React from "react";

export default function ChatItem({ title }: { title: string }) {
	return (
		<div className="rounded border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-800">
			<div className="text-sm font-medium">{title}</div>
			<div className="mt-1 text-xs text-gray-500">No messages yet</div>
		</div>
	);
}
