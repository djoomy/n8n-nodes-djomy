import type { INodeProperties } from 'n8n-workflow';

export const payoutRetryDescription: INodeProperties[] = [
	{
		displayName: 'Payout ID',
		name: 'payoutId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['payout'], operation: ['retry'] },
		},
		description: 'ID of the failed payout inside the order',
	},
];
