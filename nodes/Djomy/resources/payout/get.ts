import type { INodeProperties } from 'n8n-workflow';

export const payoutGetDescription: INodeProperties[] = [
	{
		displayName: 'Order ID',
		name: 'orderId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: { resource: ['payout'], operation: ['get', 'getPayout', 'retry'] },
		},
		description: 'ID of the payout order, as returned by Create',
	},
];
