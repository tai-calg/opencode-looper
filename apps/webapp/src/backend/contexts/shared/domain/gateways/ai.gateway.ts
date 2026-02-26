import type { ZodSchema } from 'zod';

export interface AIGateway {
	generateText(prompt: string, systemPrompt?: string): Promise<string>;
	generateTextWithWebSearch(prompt: string, systemPrompt?: string): Promise<string>;
	generateObject<T>(prompt: string, schema: ZodSchema<T>, systemPrompt?: string): Promise<T>;
	generateObjectWithWebSearch<T>(
		prompt: string,
		schema: ZodSchema<T>,
		systemPrompt?: string,
	): Promise<T>;
}
