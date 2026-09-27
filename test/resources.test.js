'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const FakeClient = require('./fakeClient');
const Lists = require('../src/resources/lists');
const Transactional = require('../src/resources/transactional');
const Images = require('../src/resources/images');

function ok(data, meta) {
  const body = { response: { msg: { err_code: 0, text: 'OK', type: 'message' }, data } };
  if (meta) {
    body.meta = meta;
  }
  return body;
}

test('Lists.create sends name in the body', async () => {
  const client = new FakeClient();
  client.queueResponse(201, ok({ list_id: 42 }));
  const lists = new Lists(client);

  const result = await lists.create('Клиенты', { company: 'ООО Ромашка' });

  assert.equal(result.data.list_id, 42);
  const call = client.calls[0];
  assert.equal(call.method, 'POST');
  assert.ok(call.url.endsWith('/lists'));
  const decoded = JSON.parse(call.data.toString('utf8'));
  assert.equal(decoded.name, 'Клиенты');
  assert.equal(decoded.company, 'ООО Ромашка');
});

test('Lists.getMember encodes the email in the path', async () => {
  const client = new FakeClient();
  client.queueResponse(200, ok({ email: 'a+b@example.com' }));
  const lists = new Lists(client);

  await lists.getMember(1, 'a+b@example.com');

  assert.ok(client.calls[0].url.includes(encodeURIComponent('a+b@example.com')));
});

test('Lists.moveMember sends the required fields', async () => {
  const client = new FakeClient();
  client.queueResponse(200, ok(null));
  const lists = new Lists(client);

  await lists.moveMember(1, 'a@example.com', 2, 555);

  const decoded = JSON.parse(client.calls[0].data.toString('utf8'));
  assert.equal(decoded.to_list_id, 2);
  assert.equal(decoded.member_id, 555);
});

test('Lists.findMember hits the account-wide endpoint', async () => {
  const client = new FakeClient();
  client.queueResponse(200, ok([{ list_id: 1, email: 'a@example.com' }]));
  const lists = new Lists(client);

  await lists.findMember('a@example.com');

  assert.ok(client.calls[0].url.includes('/members?'));
  assert.ok(client.calls[0].url.includes(`email=${encodeURIComponent('a@example.com')}`));
});

test('Transactional.send builds the body', async () => {
  const client = new FakeClient();
  client.queueResponse(201, ok({ transaction_id: 'abc' }));
  const transactional = new Transactional(client);

  const result = await transactional.send('to@example.com', 'from@yourdomain.com', '<p>Hi</p>', {
    subject: 'Hello',
  });

  assert.equal(result.data.transaction_id, 'abc');
  const decoded = JSON.parse(client.calls[0].data.toString('utf8'));
  assert.equal(decoded.to, 'to@example.com');
  assert.equal(decoded.from_email, 'from@yourdomain.com');
  assert.equal(decoded.message, '<p>Hi</p>');
  assert.equal(decoded.subject, 'Hello');
});

test('Images.optimize base64-encodes binary data', async () => {
  const client = new FakeClient();
  client.queueResponse(200, ok({ image: Buffer.from('binary').toString('base64'), saved_bytes: 10 }));
  const images = new Images(client);

  await images.optimize(Buffer.from('raw-bytes'), { max_width: 800 });

  const decoded = JSON.parse(client.calls[0].data.toString('utf8'));
  assert.equal(decoded.image, Buffer.from('raw-bytes').toString('base64'));
  assert.equal(decoded.max_width, 800);
});

test('paginated members exposes hasMore', async () => {
  const client = new FakeClient();
  client.queueResponse(200, ok([{ email: 'a@example.com' }], { has_more: true, limit: 100 }));
  const lists = new Lists(client);

  const result = await lists.members(1);

  assert.equal(result.hasMore(), true);
  assert.equal(result.getLimit(), 100);
});
