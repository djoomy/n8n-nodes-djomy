import { createHmac } from 'crypto';
import type {
	IAuthenticate,
	ICredentialDataDecryptedObject,
	IHttpRequestHelper,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export const DJOMY_BASE_URLS = {
	sandbox: 'https://sandbox-api.djomy.africa',
	production: 'https://api.djomy.africa',
};

// Djomy expects `X-API-KEY: <clientId>:<hex HMAC-SHA256 of clientId, keyed with clientSecret>`
export function buildApiKeyHeader(clientId: string, clientSecret: string): string {
	return `${clientId}:${createHmac('sha256', clientSecret).update(clientId).digest('hex')}`;
}

// Optional: lets Djomy accept a whitelisted domain even when calling from localhost.
function partnerDomainHeader(credentials: ICredentialDataDecryptedObject): Record<string, string> {
	const domain = ((credentials.partnerDomain as string) ?? '').trim();
	return domain ? { 'X-PARTNER-DOMAIN': domain } : {};
}

// Payout endpoints want a Bearer JWT (valid 1h) obtained from POST /v1/auth, not the raw X-API-KEY.
export async function fetchAccessToken(
	helper: IHttpRequestHelper,
	credentials: ICredentialDataDecryptedObject,
): Promise<{ accessToken: string }> {
	const baseUrl =
		credentials.environment === 'production' ? DJOMY_BASE_URLS.production : DJOMY_BASE_URLS.sandbox;
	const response = (await helper.helpers.httpRequest({
		method: 'POST',
		url: `${baseUrl}/v1/auth`,
		headers: {
			'X-API-KEY': buildApiKeyHeader(
				credentials.clientId as string,
				credentials.clientSecret as string,
			),
			...partnerDomainHeader(credentials),
		},
		body: {},
		json: true,
	})) as { data: { accessToken: string } };
	return { accessToken: response.data.accessToken };
}

export class DjomyApi implements ICredentialType {
	name = 'djomyApi';

	displayName = 'Djomy API';

	icon = {
		light: 'file:../nodes/Djomy/djomy.svg',
		dark: 'file:../nodes/Djomy/djomy.dark.svg',
	} as const;

	documentationUrl = 'https://developers.djomy.africa';

	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{ name: 'Sandbox', value: 'sandbox' },
				{ name: 'Production', value: 'production' },
			],
			default: 'sandbox',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			required: true,
			default: '',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
		},
		{
			displayName: 'Partner Domain',
			name: 'partnerDomain',
			type: 'string',
			default: '',
			placeholder: 'e.g. mystore.com',
			description: 'Optional. Domain allowed by Djomy, sent as the X-PARTNER-DOMAIN header.',
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'hidden',
			typeOptions: { password: true, expirable: true },
			default: '',
		},
	];

	preAuthentication = async function (
		this: IHttpRequestHelper,
		credentials: ICredentialDataDecryptedObject,
	) {
		return await fetchAccessToken(this, credentials);
	};

	// Djomy checks both: the Bearer JWT and the signed X-API-KEY on every request.
	authenticate: IAuthenticate = async (credentials, requestOptions) => ({
		...requestOptions,
		headers: {
			...requestOptions.headers,
			Authorization: `Bearer ${credentials.accessToken as string}`,
			'X-API-KEY': buildApiKeyHeader(
				credentials.clientId as string,
				credentials.clientSecret as string,
			),
			...partnerDomainHeader(credentials),
		},
	});

	test: ICredentialTestRequest = {
		request: {
			baseURL: `={{$credentials.environment === 'production' ? '${DJOMY_BASE_URLS.production}' : '${DJOMY_BASE_URLS.sandbox}'}}`,
			url: '/v1/payout-orders',
			qs: { page: 0, size: 1 },
		},
	};
}
