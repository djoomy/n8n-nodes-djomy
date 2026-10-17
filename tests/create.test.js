const test = require('node:test');
const assert = require('node:assert');
const { createOrderPreSend } = require('../dist/nodes/Djomy/resources/payout/create');

const run = (params) =>
	createOrderPreSend.call(
		{ getNodeParameter: (n, d) => (n in params ? params[n] : d) },
		{ method: 'POST', url: '/v1/payout-orders' },
	);

const base = {
	orderDescription: 'Commission',
	beneficiaryName: 'Mamadou Diallo',
	amount: 150000,
	providerCode: 'OM',
	accountNumber: '622000000',
	dryRun: false,
};

test('builds one order with one item, optional fields omitted', async () => {
	const r = await run(base);
	assert.deepStrictEqual(r.body, {
		description: 'Commission',
		items: [
			{
				amount: 150000,
				beneficiary: { name: 'Mamadou Diallo' },
				destination: {
					type: 'WALLET',
					countryCode: 'GN',
					currencyCode: 'GNF',
					account: { accountNumber: '622000000', providerCode: 'OM' },
				},
			},
		],
	});
	assert.strictEqual(r.qs, undefined);
});

test('merchant reference, message and dryRun are sent when set', async () => {
	const r = await run({
		...base,
		dryRun: true,
		additionalFields: { merchantReference: 'row-7', message: 'Sales' },
	});
	assert.strictEqual(r.body.items[0].itemMerchantReference, 'row-7');
	assert.strictEqual(r.body.items[0].message, 'Sales');
	assert.deepStrictEqual(r.qs, { dryRun: true });
});
