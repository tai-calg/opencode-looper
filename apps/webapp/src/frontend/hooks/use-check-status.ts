'use client';

import type { CheckDetail } from '@/backend/contexts/content-check/presentation/loaders/check-detail.loader';
import { useCallback, useEffect, useState } from 'react';

type UseCheckStatusOptions = {
	initialData: CheckDetail;
	pollingInterval?: number;
};

export function useCheckStatus({ initialData, pollingInterval = 3000 }: UseCheckStatusOptions) {
	const [data, setData] = useState<CheckDetail>(initialData);
	const [isPolling, setIsPolling] = useState(initialData.status === 'processing');

	const refresh = useCallback(async () => {
		try {
			const res = await fetch(`/api/checks/${initialData.id}`);
			if (res.ok) {
				const updated = await res.json();
				setData(updated);
				if (updated.status !== 'processing') {
					setIsPolling(false);
				}
			}
		} catch {
			// ネットワークエラー時はポーリング継続
		}
	}, [initialData.id]);

	useEffect(() => {
		if (!isPolling) return;

		const timer = setInterval(refresh, pollingInterval);
		return () => clearInterval(timer);
	}, [isPolling, pollingInterval, refresh]);

	return { data, isPolling, refresh };
}
