import React from "react";

export default function ChatItem({ title }: { title: string }) {
	return (
		<div className=" p-2 hover:bg-gray-50 dark:border-gray-800">
			<div className="text-sm font-medium">{title}</div>
		</div>
	);
}
