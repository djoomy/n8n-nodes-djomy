import { createHmac, timingSafeEqual } from 'crypto';
import {
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type IWebhookFunctions,
	type IWebhookResponseData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

// Header is `X-Signature-Webhook: V2:<hex HMAC-SHA256(clientSecret, raw body)>`
export function isValidSignature(header: string, rawBody: Buffer, clientSecret: string): boolean {
	const received = Buffer.from(
		header
			.slice(header.indexOf(':') + 1)
			.trim()
			.toLowerCase(),
	);
	const expected = Buffer.from(createHmac('sha256', clientSecret).update(rawBody).digest('hex'));
	return received.length === expected.length && timingSafeEqual(received, expected);
}

export class DjomyTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Djomy Trigger',
		name: 'djomyTrigger',
		icon: { light: 'file:djomy.svg', dark: 'file:djomy.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["statuses"].join(", ") || "all payout events"}}',
		description: 'Starts the workflow when Djomy sends a payout webhook',
		defaults: {
			name: 'Djomy Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'djomyApi', required: true }],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'djomy',
			},
		],
		properties: [
			{
				displayName:
					'Copy the webhook URL below into your Djomy merchant space (Developer, Webhook). Djomy keeps one URL per merchant, so use the Production URL once the workflow is active',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Payout Statuses',
				name: 'statuses',
				type: 'multiOptions',
				options: [
					{ name: 'Failed', value: 'FAILED' },
					{ name: 'Processing', value: 'PROCESSING' },
					{ name: 'Rejected', value: 'REJECTED' },
					{ name: 'Success', value: 'SUCCESS' },
				],
				default: ['SUCCESS', 'FAILED', 'REJECTED'],
				description: 'Only start for payouts reaching one of these statuses. Leave empty for all.',
			},
			{
				displayName: 'Verify Signature',
				name: 'verifySignature',
				type: 'boolean',
				default: true,
				description:
					'Whether to reject requests whose X-Signature-Webhook does not match the credential Client Secret',
			},
		],
	};

	// ponytail: Djomy has one webhook URL per merchant, pasted manually; auto-register would overwrite it
	webhookMethods = {
		default: {
			async checkExists() {
				return true;
			},
			async create() {
				return true;
			},
			async delete() {
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = this.getBodyData() as {
			eventType?: string;
			data?: { payout?: { status?: string } };
		};

		if (this.getNodeParameter('verifySignature') as boolean) {
			const { clientSecret } = await this.getCredentials('djomyApi');
			const header = this.getHeaderData()['x-signature-webhook'];
			if (
				typeof header !== 'string' ||
				!req.rawBody ||
				!isValidSignature(header, req.rawBody, clientSecret as string)
			) {
				throw new NodeOperationError(this.getNode(), 'Invalid Djomy webhook signature');
			}
		}

		const statuses = this.getNodeParameter('statuses') as string[];
		const status = body.data?.payout?.status;
		if (statuses.length && !(status && statuses.includes(status))) {
			return { webhookResponse: 'ignored' };
		}

		return { workflowData: [this.helpers.returnJsonArray(body as IDataObject)] };
	}
}
