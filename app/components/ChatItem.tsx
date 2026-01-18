import React from "react";

export default function ChatItem({ title }: { title: string }) {
	return (
		<div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-slate-100 transition hover:border-white/30 hover:bg-white/10">
			<div className="text-sm font-semibold leading-tight text-slate-50">
				{title}
			</div>
		</div>
	);
}
