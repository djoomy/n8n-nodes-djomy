import type { INodeProperties } from 'n8n-workflow';

export const payoutRetryDescription: INodeProperties[] = [
	{
		displayName: 'Payout ID',
		name: 'payoutId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['payout'], operation: ['getPayout', 'retry'] },
		},
		description: 'ID of the payout inside the order',
	},
];
