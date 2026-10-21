import type { INodeProperties } from 'n8n-workflow';
import { payoutCreateDescription, createOrderPreSend } from './create';
import { payoutGetDescription } from './get';
import { payoutGetManyDescription } from './getAll';
import { payoutRetryDescription } from './retry';

const showOnlyForPayouts = {
	resource: ['payout'],
};

const unwrapData = [{ type: 'rootProperty' as const, properties: { property: 'data' } }];

export const payoutDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForPayouts,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a payout',
				description: 'Create a payout order with a single payout to one beneficiary',
				routing: {
					request: { method: 'POST', url: '/v1/payout-orders' },
					send: { preSend: [createOrderPreSend] },
					output: { postReceive: unwrapData },
				},
			},
			{
				name: 'Get Payout Order',
				value: 'get',
				action: 'Get a payout order',
				description: 'Get a payout order, including the status of its payouts',
				routing: {
					request: { method: 'GET', url: '=/v1/payout-orders/{{$parameter.orderId}}' },
					output: { postReceive: unwrapData },
				},
			},
			{
				name: 'Get Payout',
				value: 'getPayout',
				action: 'Get a payout',
				description: 'Get a single payout (payout item) inside an order',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/payout-orders/{{$parameter.orderId}}/payout-items/{{$parameter.payoutId}}',
					},
					output: { postReceive: unwrapData },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many payout orders',
				description: 'Get many payout orders',
				routing: {
					request: { method: 'GET', url: '/v1/payout-orders' },
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'data.content' } }],
					},
				},
			},
			{
				name: 'Retry',
				value: 'retry',
				action: 'Retry a failed payout',
				description: 'Resubmit a failed or rejected payout to the provider',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/payout-orders/{{$parameter.orderId}}/payout-items/{{$parameter.payoutId}}/retry',
					},
					output: { postReceive: unwrapData },
				},
			},
		],
		default: 'create',
	},
	...payoutCreateDescription,
	...payoutGetDescription,
	...payoutGetManyDescription,
	...payoutRetryDescription,
];
