import React from "react";

import Image from "next/image";

interface DonationModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
	isOpen,
	onClose,
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
			<div className="glass-strong neon-border relative max-w-[90%] rounded-2xl border border-white/12 p-6 text-slate-100 shadow-lg md:max-w-[720px]">
				<button
					type="button"
					onClick={onClose}
					aria-label="Close"
					className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-100 transition hover:border-white/30 hover:bg-white/20"
				>
					<svg
						className="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fillRule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clipRule="evenodd"
						/>
					</svg>
				</button>

				<h2 className="mb-4 text-center text-lg font-bold">
					Your donation helps cover development and maintenance costs, keeping
					the app running while enabling new features and apps.
				</h2>
				<h2 className="mb-6 text-center text-lg font-bold">
					您的捐赠有助于支付开发和维护成本，
					使应用持续运行，同时推动新功能及新应用的开发。
				</h2>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					{/* QR Code Section */}
					<div className="space-y-6">
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
							<h3 className="mb-2 font-semibold text-slate-50">WeChat Pay</h3>
							<Image
								src="/donate/wechatQR.png"
								alt="WeChat Pay QR"
								width={200}
								height={200}
								className="mx-auto rounded-lg border border-white/10 bg-white/5 p-2 shadow"
							/>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
							<h3 className="mb-2 font-semibold text-slate-50">Alipay</h3>
							<Image
								src="/donate/AlipayQR.png"
								alt="Alipay QR"
								width={200}
								height={200}
								className="mx-auto"
							/>
						</div>
					</div>

					{/* Other Payment Methods */}
					<div className="space-y-6">
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
							<h3 className="mb-2 font-semibold text-slate-50">
								Buy Me a Coffee
							</h3>
							<Image
								src="/donate/BuyMeCoffeeQR.png"
								alt="Buy Me a Coffee QR"
								width={200}
								height={200}
								className="mx-auto"
							/>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
							<h3 className="mb-2 font-semibold text-slate-50">
								EMT (Email Money Transfer)
							</h3>
							<p className="break-all text-slate-200">
								lulu.talking@outlook.com
							</p>
						</div>
					</div>
				</div>

				<p className="mt-6 text-center text-slate-300">
					Thank you for supporting our AI Chat project!
				</p>
				<p className="mt-2 text-center text-slate-300">
					感谢您为支持我们的 AI Chat 项目提供的赞助！
				</p>
			</div>
		</div>
	);
};
