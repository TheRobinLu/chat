"use client";

import * as React from "react";
import { DonationModal } from "./DonationModal";
import packageJson from "../../package.json";

export default function Footer() {
	const [isDonateOpen, setIsDonateOpen] = React.useState(false);
	const appVersion = packageJson.version ?? "";

	return (
		<>
			<DonationModal
				isOpen={isDonateOpen}
				onClose={() => setIsDonateOpen(false)}
			/>
			<footer className="glass-panel neon-border mt-6 flex flex-col items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200 backdrop-blur sm:flex-row sm:justify-between">
				<span className="font-medium tracking-wide">
					© 2026 LuluTalking Inc • v{appVersion}
				</span>
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => setIsDonateOpen(true)}
						className="button-primary px-3 py-1"
					>
						Donate
					</button>
					<a
						className="button-ghost px-3 py-1"
						href="mailto:lulu.talking@outlook.com"
					>
						Contact Us
					</a>
				</div>
			</footer>
		</>
	);
}
