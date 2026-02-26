import { Source } from '../../domain/models/source.model';
import type { SourceRepository } from '../../domain/repositories/source.repository';

export class CreateSourceUseCase {
	constructor(private readonly sourceRepository: SourceRepository) {}

	async execute(params: { type: string; name: string; url: string }): Promise<Source> {
		const result = Source.create(params);
		if (!result.success) throw new Error(result.error);
		await this.sourceRepository.save(result.value);
		return result.value;
	}
}
