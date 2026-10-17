import type {
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

const showOnlyForPayoutCreate = {
	operation: ['create'],
	resource: ['payout'],
};

// Wallet payouts in Guinea (GNF) only for now.
// One order holds exactly one payout item, so each input item maps to one order.
export async function createOrderPreSend(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const get = (name: string) => this.getNodeParameter(name) as string;
	const extra = this.getNodeParameter('additionalFields', {}) as {
		message?: string;
		merchantReference?: string;
	};

	requestOptions.body = {
		description: get('orderDescription'),
		items: [
			{
				amount: this.getNodeParameter('amount') as number,
				beneficiary: { name: get('beneficiaryName') },
				destination: {
					type: 'WALLET',
					countryCode: 'GN',
					currencyCode: 'GNF',
					account: { accountNumber: get('accountNumber'), providerCode: get('providerCode') },
				},
				...(extra.message && { message: extra.message }),
				...(extra.merchantReference && { itemMerchantReference: extra.merchantReference }),
			},
		],
	};
	if (this.getNodeParameter('dryRun') as boolean) {
		requestOptions.qs = { ...requestOptions.qs, dryRun: true };
	}
	return requestOptions;
}

export const payoutCreateDescription: INodeProperties[] = [
	{
		displayName: 'Order Description',
		name: 'orderDescription',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: showOnlyForPayoutCreate },
		description: 'Label of the payout order',
	},
	{
		displayName: 'Beneficiary Name',
		name: 'beneficiaryName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: showOnlyForPayoutCreate },
		description: 'Name of the person receiving the money',
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		default: 0,
		required: true,
		typeOptions: { minValue: 1 },
		displayOptions: { show: showOnlyForPayoutCreate },
		description: 'Amount to send to the beneficiary, excluding fees',
	},
	{
		displayName: 'Provider',
		name: 'providerCode',
		type: 'options',
		options: [
			{ name: 'Kulu', value: 'KULU' },
			{ name: 'MTN MoMo', value: 'MOMO' },
			{ name: 'Orange Money', value: 'OM' },
			{ name: 'Paycard', value: 'PAYCARD' },
			{ name: 'Soutra Money', value: 'SOUTRA_MONEY' },
		],
		default: 'OM',
		displayOptions: { show: showOnlyForPayoutCreate },
	},
	{
		displayName: 'Account Number',
		name: 'accountNumber',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: showOnlyForPayoutCreate },
		description: 'Wallet or bank account number of the beneficiary',
	},
	{
		displayName: 'Dry Run',
		name: 'dryRun',
		type: 'boolean',
		default: false,
		displayOptions: { show: showOnlyForPayoutCreate },
		description: 'Whether to only compute fees and totals without creating or sending anything',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: showOnlyForPayoutCreate },
		options: [
			{
				displayName: 'Merchant Reference',
				name: 'merchantReference',
				type: 'string',
				default: '',
				description: 'Your own reference for this payout, for example the spreadsheet row ID',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: '',
				description: 'Reason for the payment',
			},
		],
	},
];
