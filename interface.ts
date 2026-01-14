export interface IChat {
	topic: string;
	createDate: string;
	messages: Array<IMessage>;
	updateDate?: string;
}

export interface IMessage {
	role: "user" | "assistant" | "system";
	content: string;
}
