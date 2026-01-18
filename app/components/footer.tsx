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
			<footer className="flex flex-col items-center gap-2 border-t border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 sm:flex-row sm:justify-between">
				<span className="font-medium">
					© 2026 LuluTalking Inc • v{appVersion}
				</span>
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => setIsDonateOpen(true)}
						className="rounded bg-blue-600 px-3 py-1 text-white transition hover:bg-blue-700"
					>
						Donate
					</button>
					<a
						className="rounded border border-gray-300 px-3 py-1 text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
						href="mailto:lulu.talking@outlook.com"
					>
						Contact Us
					</a>
				</div>
			</footer>
		</>
	);
}
