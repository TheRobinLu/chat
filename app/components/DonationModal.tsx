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
		<div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
			<div className="bg-white p-6 rounded-lg max-w-[90%] md:max-w-[640px] relative">
				<button
					type="button"
					onClick={onClose}
					aria-label="Close"
					className="absolute right-3 top-3 inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 shadow-sm"
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

				<h2 className="text-lg font-bold text-center mb-6">
					Your donation helps cover development and maintenance costs, keeping
					the app running while enabling new features and apps.
				</h2>
				<h2 className="text-lg font-bold text-center mb-6">
					您的捐赠有助于支付开发和维护成本，
					使应用持续运行，同时推动新功能及新应用的开发。
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* QR Code Section */}
					<div className="space-y-6">
						<div className="text-center">
							<h3 className="font-semibold mb-2">WeChat Pay</h3>
							<Image
								src="/donate/wechatQR.png"
								alt="WeChat Pay QR"
								width={200}
								height={200}
								className="mx-auto"
							/>
						</div>
						<div className="text-center">
							<h3 className="font-semibold mb-2">Alipay</h3>
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
						<div className="text-center">
							<h3 className="font-semibold mb-2">Buy Me a Coffee</h3>
							<Image
								src="/donate/BuyMeCoffeeQR.png"
								alt="Buy Me a Coffee QR"
								width={200}
								height={200}
								className="mx-auto"
							/>
						</div>
						<div className="text-center p-4 bg-gray-50 rounded-lg">
							<h3 className="font-semibold mb-2">EMT (Email Money Transfer)</h3>
							<p className="text-gray-600 break-all">
								lulu.talking@outlook.com
							</p>
						</div>
					</div>
				</div>

				<p className="text-center text-gray-600 mt-6">
					Thank you for supporting our AI Chat project!
				</p>
				<p className="text-center text-gray-600 mt-6">
					感谢您为支持我们的 AI Chat 项目提供的赞助！
				</p>
			</div>
		</div>
	);
};
