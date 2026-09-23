# @dashamail/node

Official Node.js SDK for the [DashaMail REST API v2](https://dashamail.ru/api/) — address
lists, campaigns, automations, transactional email, reports, dialogs, inbound mail routing
and image optimization, from a single client with no dependencies beyond Node's own
`http`/`https` modules.

## Requirements

- Node.js 12 or newer (standard library only)

## Installation

```bash
npm install @dashamail/node
```

The package is published under the `@dashamail` scope (the bare `dashamail` name on npm
belongs to an unrelated third-party project).

## Getting an API key

Личный кабинет → Аккаунт → API и интеграции. Treat it like a password: it acts on behalf
of the whole account.

## Quickstart

```js
const DashaMail = require('@dashamail/node');

const dashamail = new DashaMail('YOUR_API_KEY');

const balance = await dashamail.account.balance();
console.log(balance.data.balance);

const created = await dashamail.lists.create('Newsletter');
await dashamail.lists.addMember(created.data.list_id, 'subscriber@example.com', { merge_1: 'Иван' });

await dashamail.transactional.send(
  'subscriber@example.com',
  'sender@yourdomain.com',
  '<p>Спасибо за подписку!</p>',
  { subject: 'Добро пожаловать' }
);
```

TypeScript types are bundled (`index.d.ts`) — no `@types/` package needed.

See [`examples/quickstart.js`](examples/quickstart.js) for a fuller walkthrough, and
[dashamail.ru/api](https://dashamail.ru/api/) for the full parameter reference of every
endpoint — the SDK mirrors it method-for-method. Optional parameters are passed as a plain
object matching the API's field names (snake_case, e.g. `merge_1`, `from_email`).

## Resources

`DashaMail` exposes one property per section of the API. Every method returns a Promise
resolving to a [`Response`](src/response.js) (wraps the `data` payload, iterable when it's
a list) or rejects with an `ApiException`.

| Property          | Class                              | Covers |
|-------------------|--------------------------------------|--------|
| `.lists`          | `Lists`         | Address lists, subscribers, merge fields, imports |
| `.segments`       | `Segments`      | Saved subscriber segments |
| `.campaigns`      | `Campaigns`     | Bulk campaigns: draft, launch, pause, A/B tests, attachments, folders |
| `.automations`    | `Automations`   | Event-triggered emails |
| `.workflows`      | `Workflows`     | Visual-builder automation scenarios |
| `.templates`      | `Templates`     | Saved HTML templates and templated campaigns |
| `.reports`        | `Reports`       | Campaign statistics, events, click/bounce/geo breakdowns, A/B results |
| `.transactional`  | `Transactional` | One-off transactional email: send, status, log, stats |
| `.account`        | `Account`       | Balance, senders, sending domains, webhooks |
| `.dialogs`        | `Dialogs`       | Subscriber replies to campaigns |
| `.router`         | `Router`        | Inbound mail: domains, routing rules, stored messages |
| `.images`         | `Images`        | Resize/recompress an image before using it in a campaign |

## Working with responses

```js
const members = await dashamail.lists.members(listId, { limit: 100 });

for (const member of members) {   // Response is iterable
  console.log(member.email);
}

members.length;                   // number of rows in this page
members.data;                     // the raw array/object, if you'd rather not iterate
members.hasMore();                // true if there's another page (see Pagination below)
```

## Pagination

List endpoints (`lists.members()`, `lists.unsubscribed()`, `transactional.log()`, ...)
don't return a total count — DashaMail tells you instead whether there's another page:

```js
let start = 0;
for (;;) {
  const page = await dashamail.lists.members(listId, { start, limit: 100 });
  for (const member of page) { /* ... */ }
  start += page.getLimit();
  if (!page.hasMore()) break;
}
```

## Error handling

Every non-2xx response throws a subclass of `ApiException`, chosen by HTTP status:

| Exception                  | HTTP status |
|-----------------------------|------|
| `AuthenticationException`  | 401 |
| `PaymentRequiredException` | 402 |
| `AuthorizationException`   | 403 |
| `NotFoundException`        | 404 |
| `ConflictException`        | 409 |
| `PayloadTooLargeException` | 413 |
| `ValidationException`      | 422 |
| `RateLimitException`       | 429 |
| `ServerException`          | 5xx |

```js
const { ApiException, RateLimitException } = require('@dashamail/node');

try {
  await dashamail.campaigns.create({ list_id: 1, subject: 'Hi', from_email: 'a@b.com', from_name: 'A' });
} catch (err) {
  if (err instanceof RateLimitException) {
    await sleep((err.getRetryAfter() || 60) * 1000);
  } else if (err instanceof ApiException) {
    // err.apiCode     — DashaMail's own stable error code (see https://dashamail.ru/api/errors/)
    // err.httpStatus  — the HTTP status of the response
    // err.details     — any extra structured context the API attached
    console.error(err.apiCode, err.message);
  } else {
    throw err;
  }
}
```

A request that never got an HTTP response at all (DNS, TLS, timeout...) rejects with
`NetworkException` instead.

## Images

`POST /images/optimize` is the one endpoint that isn't plain JSON in and out:

```js
const fs = require('fs');

// From a Buffer already in memory:
const result = await dashamail.images.optimize(fs.readFileSync('banner.png'), { max_width: 1600 });
fs.writeFileSync('banner-optimized.png', Buffer.from(result.data.image, 'base64'));

// Straight from disk, without loading it into a Buffer first:
const result2 = await dashamail.images.optimizeFile('/path/to/banner.png');

// Same, but skip the base64 round-trip and get raw bytes back:
const binary = await dashamail.images.optimizeFileBinary('/path/to/banner.png');
binary.saveTo('/path/to/banner-optimized.png');
```

## Advanced configuration

```js
const dashamail = new DashaMail('YOUR_API_KEY', {
  timeout: 60000,                             // milliseconds, default 30000
  baseUrl: 'https://api.dashamail.com/v2',    // override for testing/proxying
  userAgent: 'my-app/1.0 (+dashamail-node)',
});

// Escape hatch for an endpoint the SDK doesn't wrap yet:
await dashamail.client.request('GET', '/some/new/endpoint', { foo: 'bar' });
```

## Testing

```bash
node --test test/
```

## License

MIT, see [LICENSE](LICENSE).
