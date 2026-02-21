export interface ContentCheckListItemDto {
	id: string;
	source: 'web' | 'slack';
	status: string;
	createdAt: Date;
	segmentCount: number;
	summary: {
		error: number;
		warning: number;
		info: number;
	};
}

export interface ContentCheckListDto {
	items: ContentCheckListItemDto[];
}
