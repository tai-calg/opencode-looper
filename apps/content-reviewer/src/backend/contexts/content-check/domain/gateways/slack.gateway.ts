export interface SlackGateway {
	postMessage(channelId: string, threadTs: string, text: string): Promise<void>;
}
