'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const FakeClient = require('./fakeClient');
const {
  AuthenticationException,
  NotFoundException,
  RateLimitException,
  ValidationException,
} = require('../src/exceptions');
const Response = require('../src/response');

function ok(data, meta, message = 'OK') {
  const body = { response: { msg: { err_code: 0, text: message, type: 'message' }, data } };
  if (meta) {
    body.meta = meta;
  }
  return body;
}

test('successful request unwraps response.data', async () => {
  const client = new FakeClient();
  client.queueResponse(200, ok([{ id: 1, name: 'Клиенты' }]));

  const result = await client.request('GET', '/lists');

  assert.ok(result instanceof Response);
  assert.deepEqual(result.data, [{ id: 1, name: 'Клиенты' }]);
  assert.equal(result.message, 'OK');
  assert.equal(result.length, 1);
});

test('pagination meta is exposed', async () => {
  const client = new FakeClient();
  client.queueResponse(200, ok([1, 2, 3], { has_more: true, limit: 3 }));

  const result = await client.request('GET', '/lists/1/members');

  assert.equal(result.hasMore(), true);
  assert.equal(result.getLimit(), 3);
});

test('204 No Content returns null', async () => {
  const client = new FakeClient();
  client.queueResponse(204, '');

  const result = await client.request('DELETE', '/lists/1');

  assert.equal(result, null);
});

test('authorization header is sent', async () => {
  const client = new FakeClient('secret-key-123');
  client.queueResponse(200, ok([]));

  await client.request('GET', '/lists');

  assert.equal(client.calls[0].headers.Authorization, 'Bearer secret-key-123');
});

test('JSON body is encoded and Content-Type is set', async () => {
  const client = new FakeClient();
  client.queueResponse(201, ok({ list_id: 5 }));

  await client.request('POST', '/lists', null, { name: 'Тест' });

  assert.equal(client.calls[0].headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(client.calls[0].data.toString('utf8')), { name: 'Тест' });
});

test('error statuses map to exception classes', async () => {
  const cases = [
    [401, AuthenticationException],
    [404, NotFoundException],
    [422, ValidationException],
    [429, RateLimitException],
  ];
  for (const [status, ExpectedClass] of cases) {
    const client = new FakeClient();
    client.queueResponse(status, { error: { code: 999, message: 'boom', details: {} } });
    await assert.rejects(() => client.request('GET', '/whatever'), ExpectedClass);
  }
});

test('rate limit exposes retryAfter from details', async () => {
  const client = new FakeClient();
  client.queueResponse(429, {
    error: { code: 58, message: 'Limit', details: { limit_per_minute: 120, retry_after: 60 } },
  });

  try {
    await client.request('GET', '/lists');
    assert.fail('Expected RateLimitException');
  } catch (err) {
    assert.ok(err instanceof RateLimitException);
    assert.equal(err.getRetryAfter(), 60);
    assert.equal(err.apiCode, 58);
  }
});

test('query params are appended to the URL', async () => {
  const client = new FakeClient();
  client.queueResponse(200, ok([]));

  await client.request('GET', '/lists', { state: 'active' });

  assert.ok(client.calls[0].url.includes('state=active'));
});
