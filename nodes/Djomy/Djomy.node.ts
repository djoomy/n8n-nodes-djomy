import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { DJOMY_BASE_URLS } from '../../credentials/DjomyApi.credentials';
import { payoutDescription } from './resources/payout';

export class Djomy implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Djomy',
		name: 'djomy',
		icon: { light: 'file:djomy.svg', dark: 'file:djomy.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send payouts with the Djomy API',
		defaults: {
			name: 'Djomy',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'djomyApi', required: true }],
		requestDefaults: {
			baseURL: `={{$credentials.environment === 'production' ? '${DJOMY_BASE_URLS.production}' : '${DJOMY_BASE_URLS.sandbox}'}}`,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [{ name: 'Payout', value: 'payout' }],
				default: 'payout',
			},
			...payoutDescription,
		],
	};
}
