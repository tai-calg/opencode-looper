import type {
	AIGateway,
	GenerateOptions,
} from '@/backend/contexts/shared/domain/gateways/ai.gateway';
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-6';
const DEFAULT_MAX_TOKENS = 4096;

const STUB_SEGMENTATION_RESPONSE = '[{"text":"テスト段落"}]';
const STUB_CHECK_RESPONSE =
	'[{"checkType":"fact_check","severity":"info","message":"テスト結果","suggestion":null}]';
const STUB_CHECK_RESULT = '{"severity":"info","message":"テスト結果","suggestion":null}';

function isStubMode(): boolean {
	const key = process.env.ANTHROPIC_API_KEY;
	return !key || key === 'test' || key === 'undefined';
}

function buildStubResponse(prompt: string): string {
	if (prompt.includes('セマンティックな段落') || prompt.includes('segmentIndex')) {
		return STUB_SEGMENTATION_RESPONSE;
	}
	if (prompt.includes('checkType') || prompt.includes('severity')) {
		return STUB_CHECK_RESPONSE;
	}
	return STUB_CHECK_RESULT;
}

export class AnthropicAIGateway implements AIGateway {
	private readonly client: Anthropic | null;

	constructor() {
		if (isStubMode()) {
			this.client = null;
		} else {
			this.client = new Anthropic({
				apiKey: process.env.ANTHROPIC_API_KEY,
			});
		}
	}

	async generate(prompt: string, options?: GenerateOptions): Promise<string> {
		if (isStubMode()) {
			return buildStubResponse(prompt);
		}

		const client = this.client as Anthropic;
		const response = await client.messages.create({
			model: MODEL,
			max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
			...(options?.temperature !== undefined && { temperature: options.temperature }),
			messages: [{ role: 'user', content: prompt }],
		});

		const textBlock = response.content.find((block) => block.type === 'text');
		if (!textBlock || textBlock.type !== 'text') {
			throw new Error('No text block in response');
		}
		return textBlock.text;
	}

	async generateWithWebSearch(prompt: string, options?: GenerateOptions): Promise<string> {
		if (isStubMode()) {
			return buildStubResponse(prompt);
		}

		const client = this.client as Anthropic;
		const response = await client.messages.create({
			model: MODEL,
			max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
			...(options?.temperature !== undefined && { temperature: options.temperature }),
			// web_search_20250305 is not yet typed in the SDK, cast required
			tools: [
				{
					type: 'web_search_20250305',
					name: 'web_search',
				} as unknown as Anthropic.Messages.ToolUnion,
			],
			messages: [{ role: 'user', content: prompt }],
		});

		const textBlocks = response.content.filter((block) => block.type === 'text');
		const lastTextBlock = textBlocks[textBlocks.length - 1];
		if (!lastTextBlock || lastTextBlock.type !== 'text') {
			throw new Error('No text block in response');
		}
		return lastTextBlock.text;
	}

	async *generateStream(prompt: string, options?: GenerateOptions): AsyncGenerator<string> {
		if (isStubMode()) {
			yield buildStubResponse(prompt);
			return;
		}

		const client = this.client as Anthropic;
		const stream = await client.messages.stream({
			model: MODEL,
			max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
			...(options?.temperature !== undefined && { temperature: options.temperature }),
			messages: [{ role: 'user', content: prompt }],
		});

		for await (const event of stream) {
			if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
				yield event.delta.text;
			}
		}
	}
}
