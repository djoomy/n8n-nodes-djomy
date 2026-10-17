import type { INodeProperties } from 'n8n-workflow';

export const payoutGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: { minValue: 1, maxValue: 300 },
		displayOptions: {
			show: { resource: ['payout'], operation: ['getAll'] },
		},
		routing: {
			send: { type: 'query', property: 'size' },
		},
		description: 'Max number of results to return',
	},
];
