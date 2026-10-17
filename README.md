# n8n-nodes-djomy

n8n community node for [Djomy](https://djomy.africa): send mobile money and bank payouts from any workflow, for example from rows in a Google Sheet.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

Resource **Payout**:

| Operation | What it does |
|-----------|--------------|
| Create | Creates a payout order with one payout to one beneficiary. For now payouts are wallet payouts in Guinea (GNF) only. Has a **Dry Run** switch that only computes fees. |
| Get | Gets an order and the status of its payout. |
| Get Many | Lists orders. |
| Retry | Resubmits a failed or rejected payout. |

Create returns the order, including its `payoutItems` with their `status` (`CREATED`, `READY_TO_PROCESS`, `PROCESSING`, `REJECTED`, `SUCCESS`, `FAILED`). Use **Merchant Reference** to tag the payout with your own ID, such as the sheet row.

## Credentials

Create a **Djomy API** credential with the Client ID and Client Secret from your Djomy merchant space, and pick **Sandbox** or **Production**. The credential signs `X-API-KEY: <clientId>:<HMAC-SHA256 signature>`, exchanges it for a Bearer token at `POST /v1/auth` (valid 1 hour), and refreshes the token automatically.

## Usage: pay from a Google Sheet

1. **Google Sheets Trigger**, event "Row Updated" (a status cell changes).
2. **If**: `Status` equals `Approved`. Rows that are incomplete or not approved stop here.
3. **Google Sheets, Update Row**: set `Status` to `Processing`. This is your guard against paying twice if the trigger fires again, because Djomy does not document idempotency. Step 2 must only let `Approved` through.
4. **Djomy, Payout, Create**: map beneficiary name, amount, provider and account number from the row. Set **Merchant Reference** to the row ID.
5. **Google Sheets, Update Row**: write back the payout `status` and order `reference` from the Djomy output.

Try step 4 with **Dry Run** and the Sandbox environment first.

## Compatibility

Tested against the Djomy partner API (sandbox) with n8n 1.x.

## Resources

- [Djomy API docs](https://developers.djomy.africa)
- [n8n community nodes docs](https://docs.n8n.io/integrations/#community-nodes)

## Version history

See [CHANGELOG.md](CHANGELOG.md).
