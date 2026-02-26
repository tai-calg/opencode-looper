import type { SlackGateway } from '../../domain/gateways/slack.gateway';
import type { Check } from '../../domain/models/check.model';
import type { CheckRepository } from '../../domain/repositories/check.repository';
import type { RunCheckUseCase } from './run-check.usecase';

export class HandleSlackMentionUseCase {
	constructor(
		private readonly slackGateway: SlackGateway,
		private readonly runCheckUseCase: RunCheckUseCase,
		private readonly checkRepository: CheckRepository,
	) {}

	async execute(params: {
		channel: string;
		threadTs: string;
		appUrl: string;
	}): Promise<void> {
		// 1. スレッドの全メッセージを取得
		const messages = await this.slackGateway.fetchThreadMessages(params.channel, params.threadTs);

		// 2. メッセージを結合してチェック対象テキストを生成
		const content = messages.join('\n\n');

		// 3. テキストが空の場合は早期リターン（メッセージ投稿のみ）
		if (content.trim().length === 0) {
			await this.slackGateway.postMessage(
				params.channel,
				'スレッドにチェック対象のメッセージが見つかりませんでした。',
				params.threadTs,
			);
			return;
		}

		// 4. RunCheckUseCase でチェック実行（同期的に完了まで待機）
		const checkId = await this.runCheckUseCase.execute({
			content,
			source: 'slack',
			slackChannel: params.channel,
			slackThreadTs: params.threadTs,
		});

		// 5. チェック結果を取得
		const check = await this.checkRepository.findById(checkId);
		if (!check) {
			await this.slackGateway.postMessage(
				params.channel,
				'チェック結果の取得に失敗しました。',
				params.threadTs,
			);
			return;
		}

		// 6. サマリーメッセージをフォーマットして投稿
		const summary = this.formatSummary(check, params.appUrl, checkId);
		await this.slackGateway.postMessage(params.channel, summary, params.threadTs);
	}

	private formatSummary(check: Check, appUrl: string, checkId: string): string {
		// チェック結果からカテゴリ別・重要度別の件数を集計
		const issues = check.sections.flatMap((s) => s.issues);
		const totalCount = issues.length;

		if (totalCount === 0) {
			return [
				'チェックが完了しました。指摘事項はありません。',
				'',
				`詳細を確認: ${appUrl}/checks/${checkId}`,
			].join('\n');
		}

		// カテゴリ別集計
		const byCategory = {
			fact: issues.filter((i) => i.category === 'fact').length,
			knowledge: issues.filter((i) => i.category === 'knowledge').length,
			expression: issues.filter((i) => i.category === 'expression').length,
			risk: issues.filter((i) => i.category === 'risk').length,
			quality: issues.filter((i) => i.category === 'quality').length,
		};

		// 重要度別集計
		const needsFix = issues.filter((i) => i.severity === 'needs_fix').length;
		const caution = issues.filter((i) => i.severity === 'caution').length;

		return [
			`チェックが完了しました。指摘: ${totalCount}件`,
			'',
			`  事実確認: ${byCategory.fact}件`,
			`  ナレッジ整合: ${byCategory.knowledge}件`,
			`  表現ルール: ${byCategory.expression}件`,
			`  炎上リスク: ${byCategory.risk}件`,
			`  文章品質: ${byCategory.quality}件`,
			'',
			'重要度:',
			`  要修正: ${needsFix}件`,
			`  注意: ${caution}件`,
			'',
			`詳細を確認: ${appUrl}/checks/${checkId}`,
		].join('\n');
	}
}
