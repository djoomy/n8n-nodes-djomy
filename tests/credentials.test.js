const test = require('node:test');
const assert = require('node:assert');
const { buildApiKeyHeader } = require('../dist/credentials/DjomyApi.credentials');

test('X-API-KEY is clientId:hex HMAC-SHA256(clientId, secret)', () => {
	// reference value from python: hmac.new(b'secret', b'client', 'sha256').hexdigest()
	assert.strictEqual(
		buildApiKeyHeader('client', 'secret'),
		'client:d0c6e48fa6742da86d2538cfd7e0112e458a5d2a53284bbb4d98b60002ab09b7',
	);
});

test('fetchAccessToken signs POST /v1/auth and returns data.accessToken', async () => {
	const { fetchAccessToken } = require('../dist/credentials/DjomyApi.credentials');
	let sent;
	const helper = {
		helpers: {
			httpRequest: async (o) => {
				sent = o;
				return { data: { accessToken: 'jwt-123' } };
			},
		},
	};
	const out = await fetchAccessToken(helper, {
		environment: 'sandbox',
		clientId: 'client',
		clientSecret: 'secret',
	});
	assert.deepStrictEqual(out, { accessToken: 'jwt-123' });
	assert.strictEqual(sent.url, 'https://sandbox-api.djomy.africa/v1/auth');
	assert.strictEqual(sent.method, 'POST');
	assert.strictEqual(sent.headers['X-API-KEY'], buildApiKeyHeader('client', 'secret'));
});

test('authenticate sends both Bearer token and signed X-API-KEY', async () => {
	const { DjomyApi } = require('../dist/credentials/DjomyApi.credentials');
	const out = await new DjomyApi().authenticate(
		{ clientId: 'client', clientSecret: 'secret', accessToken: 'jwt-123' },
		{ url: '/v1/payout-orders', headers: { Accept: 'application/json' } },
	);
	assert.strictEqual(out.headers.Authorization, 'Bearer jwt-123');
	assert.strictEqual(out.headers['X-API-KEY'], buildApiKeyHeader('client', 'secret'));
	assert.strictEqual(out.headers.Accept, 'application/json');
});
