import type { AIGateway } from '@/backend/contexts/shared/domain/gateways/ai.gateway';
import { z } from 'zod';

const splitResultSchema = z.object({
	sections: z.array(
		z.object({
			content: z.string().describe('セクションの本文'),
		}),
	),
});

export class SplitContentUseCase {
	constructor(private readonly aiGateway: AIGateway) {}

	async execute(content: string): Promise<string[]> {
		if (content.length <= 1000) {
			return [content];
		}

		const result = await this.aiGateway.generateObject(
			`以下のテキストをレビューに適した論理的なセクションに分割してください。
各セクションは意味的にまとまった単位にしてください。

テキスト:
${content}`,
			splitResultSchema,
			'あなたはテキスト分析の専門家です。テキストを論理的なセクションに分割する役割を担います。',
		);

		return result.sections.map((s) => s.content);
	}
}
