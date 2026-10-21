const test = require('node:test');
const assert = require('node:assert');
const { createHmac } = require('crypto');
const { isValidSignature } = require('../dist/nodes/Djomy/DjomyTrigger.node');

const body = Buffer.from('{"eventType":"payout.success"}');
const sig = createHmac('sha256', 'secret').update(body).digest('hex');

test('accepts V2:<hex hmac>, rejects wrong secret or tampered body', () => {
	assert.ok(isValidSignature(`V2:${sig}`, body, 'secret'));
	assert.ok(!isValidSignature(`V2:${sig}`, body, 'other'));
	assert.ok(!isValidSignature(`V2:${sig}`, Buffer.from('{}'), 'secret'));
	assert.ok(!isValidSignature('V2:', body, 'secret'));
});
