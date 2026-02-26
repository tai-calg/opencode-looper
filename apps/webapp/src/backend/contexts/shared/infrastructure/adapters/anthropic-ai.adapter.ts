import { anthropic } from '@ai-sdk/anthropic';
import { generateObject, generateText, stepCountIs } from 'ai';
import type { ZodSchema } from 'zod';
import type { AIGateway } from '../../domain/gateways/ai.gateway';

export class AnthropicAIAdapter implements AIGateway {
	private readonly model = anthropic('claude-sonnet-4-20250514');

	async generateText(prompt: string, systemPrompt?: string): Promise<string> {
		const { text } = await generateText({
			model: this.model,
			prompt,
			system: systemPrompt,
		});
		return text;
	}

	async generateTextWithWebSearch(prompt: string, systemPrompt?: string): Promise<string> {
		const { text } = await generateText({
			model: this.model,
			prompt,
			system: systemPrompt,
			tools: {
				web_search: anthropic.tools.webSearch_20250305(),
			},
			stopWhen: stepCountIs(5),
		});
		return text;
	}

	async generateObject<T>(prompt: string, schema: ZodSchema<T>, systemPrompt?: string): Promise<T> {
		const { object } = await generateObject({
			model: this.model,
			prompt,
			schema,
			system: systemPrompt,
		});
		return object;
	}

	async generateObjectWithWebSearch<T>(
		prompt: string,
		schema: ZodSchema<T>,
		systemPrompt?: string,
	): Promise<T> {
		// Step 1: Web 検索で情報を収集
		const searchResult = await this.generateTextWithWebSearch(prompt, systemPrompt);
		// Step 2: 検索結果を構造化出力に変換
		const { object } = await generateObject({
			model: this.model,
			prompt: `以下の分析結果を指定されたスキーマに従って構造化してください。\n\n${searchResult}`,
			schema,
			system: systemPrompt,
		});
		return object;
	}
}
