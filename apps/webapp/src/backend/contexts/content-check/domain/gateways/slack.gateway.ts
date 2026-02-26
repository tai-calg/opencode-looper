export interface SlackGateway {
	/**
	 * スレッドの全メッセージテキストを取得する。
	 * Slack API conversations.replies を使用。
	 */
	fetchThreadMessages(channel: string, threadTs: string): Promise<string[]>;

	/**
	 * チャンネル（またはスレッド）にメッセージを投稿する。
	 * Slack API chat.postMessage を使用。
	 */
	postMessage(channel: string, text: string, threadTs?: string): Promise<void>;
}
