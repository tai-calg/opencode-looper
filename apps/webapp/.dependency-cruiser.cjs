/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
	forbidden: [
		{
			name: 'no-domain-to-outside',
			comment: 'domain 層は他層に依存してはならない',
			severity: 'error',
			from: { path: '^src/backend/contexts/[^/]+/domain/' },
			to: {
				pathNot: [
					'^src/backend/contexts/[^/]+/domain/',
					'^src/backend/contexts/shared/domain/',
					'node_modules',
				],
			},
		},
		{
			name: 'no-application-to-infrastructure',
			comment: 'application 層は infrastructure 層に直接依存してはならない',
			severity: 'error',
			from: { path: '^src/backend/contexts/[^/]+/application/' },
			to: { path: '^src/backend/contexts/[^/]+/infrastructure/' },
		},
		{
			name: 'no-loader-action-to-domain',
			comment: 'loaders/actions は domain に直接依存してはならない',
			severity: 'error',
			from: { path: '^src/backend/contexts/[^/]+/presentation/(loaders|actions)/' },
			to: { path: '^src/backend/contexts/[^/]+/domain/' },
		},
		{
			name: 'no-loader-action-to-infrastructure',
			comment: 'loaders/actions は infrastructure に直接依存してはならない',
			severity: 'error',
			from: { path: '^src/backend/contexts/[^/]+/presentation/(loaders|actions)/' },
			to: { path: '^src/backend/contexts/[^/]+/infrastructure/' },
		},
		{
			name: 'no-cross-context-import',
			comment: 'Context 間の直接 import は禁止（shared と composition 間を除く）',
			severity: 'error',
			from: { path: '^src/backend/contexts/(?!shared/)([^/]+)/' },
			to: {
				path: '^src/backend/contexts/(?!shared/)([^/]+)/',
				pathNot: '^src/backend/contexts/[^/]+/presentation/composition/',
			},
		},
		{
			name: 'no-frontend-to-backend-internal',
			comment: 'フロントエンドは backend/presentation 以外を参照してはならない',
			severity: 'error',
			from: { path: '^src/(app|frontend)/' },
			to: {
				path: '^src/backend/',
				pathNot: '^src/backend/contexts/[^/]+/presentation/',
			},
		},
	],
	options: {
		doNotFollow: { path: 'node_modules' },
		tsPreCompilationDeps: true,
		tsConfig: { fileName: 'tsconfig.json' },
		enhancedResolveOptions: {
			exportsFields: ['exports'],
			conditionNames: ['import', 'require', 'node', 'default'],
		},
	},
};
