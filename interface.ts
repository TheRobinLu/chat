export interface IChat {
	topic: string;
	createDate: string;
	messages: Array<IMessage>;
}

export interface IMessage {
	role: "user" | "assistant" | "system";
	content: string;
}
