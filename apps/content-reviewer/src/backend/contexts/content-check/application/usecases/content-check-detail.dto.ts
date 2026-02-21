export interface CheckResultDetailDto {
	id: string;
	checkType: string;
	severity: string;
	message: string;
	suggestion: string | null;
}

export interface ContentSegmentDetailDto {
	id: string;
	segmentIndex: number;
	text: string;
	results: CheckResultDetailDto[];
}

export interface ContentCheckSummaryDto {
	error: number;
	warning: number;
	info: number;
}

export interface ContentCheckDetailDto {
	id: string;
	status: string;
	originalText: string;
	createdAt: Date;
	segments: ContentSegmentDetailDto[];
	summary: ContentCheckSummaryDto;
}
