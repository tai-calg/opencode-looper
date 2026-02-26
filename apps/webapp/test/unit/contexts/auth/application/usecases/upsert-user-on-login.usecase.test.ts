import { UpsertUserOnLoginUseCase } from '@/backend/contexts/auth/application/usecases/upsert-user-on-login.usecase';
import type { UserRepository } from '@/backend/contexts/auth/domain/repositories/user.repository';
import { describe, expect, it, vi } from 'vitest';

describe('UpsertUserOnLoginUseCase', () => {
	function createMockRepo(): UserRepository {
		return {
			findById: vi.fn(),
			upsert: vi.fn(),
		};
	}

	it('team-mir.ai ドメインのユーザーで domainAllowed: true が返る', async () => {
		const mockRepo = createMockRepo();
		const useCase = new UpsertUserOnLoginUseCase(mockRepo);

		const result = await useCase.execute({
			id: 'uid-1',
			email: 'taro@team-mir.ai',
			name: 'Taro',
			avatarUrl: 'https://example.com/avatar.png',
		});

		expect(result.domainAllowed).toBe(true);
		expect(result.user.email).toBe('taro@team-mir.ai');
	});

	it('team-mir.ai ドメインのユーザーで userRepository.upsert が呼ばれる', async () => {
		const mockRepo = createMockRepo();
		const useCase = new UpsertUserOnLoginUseCase(mockRepo);

		await useCase.execute({
			id: 'uid-1',
			email: 'taro@team-mir.ai',
			name: 'Taro',
			avatarUrl: null,
		});

		expect(mockRepo.upsert).toHaveBeenCalledTimes(1);
	});

	it('gmail.com ドメインのユーザーで domainAllowed: false が返る', async () => {
		const mockRepo = createMockRepo();
		const useCase = new UpsertUserOnLoginUseCase(mockRepo);

		const result = await useCase.execute({
			id: 'uid-2',
			email: 'user@gmail.com',
			name: 'User',
			avatarUrl: null,
		});

		expect(result.domainAllowed).toBe(false);
	});

	it('gmail.com ドメインのユーザーで userRepository.upsert が呼ばれない', async () => {
		const mockRepo = createMockRepo();
		const useCase = new UpsertUserOnLoginUseCase(mockRepo);

		await useCase.execute({
			id: 'uid-2',
			email: 'user@gmail.com',
			name: 'User',
			avatarUrl: null,
		});

		expect(mockRepo.upsert).not.toHaveBeenCalled();
	});
});
