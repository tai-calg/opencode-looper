import type { ZodSchema } from 'zod';
import type { AIGateway } from '../../domain/gateways/ai.gateway';

export class StubAIAdapter implements AIGateway {
	async generateText(prompt: string, _systemPrompt?: string): Promise<string> {
		return `[Stub] テキスト生成結果: ${prompt.slice(0, 50)}...`;
	}

	async generateTextWithWebSearch(prompt: string, _systemPrompt?: string): Promise<string> {
		return `[Stub] Web検索付きテキスト生成結果: ${prompt.slice(0, 50)}...`;
	}

	async generateObject<T>(
		_prompt: string,
		schema: ZodSchema<T>,
		_systemPrompt?: string,
	): Promise<T> {
		// スキーマのデフォルト値を使ってパース（空の issues 配列を返す）
		return schema.parse({ issues: [] });
	}

	async generateObjectWithWebSearch<T>(
		_prompt: string,
		schema: ZodSchema<T>,
		_systemPrompt?: string,
	): Promise<T> {
		return schema.parse({ issues: [] });
	}
}
