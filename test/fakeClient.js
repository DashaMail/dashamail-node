'use strict';

const Client = require('../src/client');

/**
 * A Client that never touches the network: _execute() is stubbed to return
 * a canned HTTP response queued up front, so resource classes can be
 * tested against realistic API payloads.
 */
class FakeClient extends Client {
  constructor(apiKey = 'test-key', options = {}) {
    super(apiKey, options);
    this._queue = [];
    this.calls = [];
  }

  queueResponse(status, decodedBodyOrRaw, headers = {}) {
    let body;
    if (Buffer.isBuffer(decodedBodyOrRaw) || typeof decodedBodyOrRaw === 'string') {
      body = Buffer.from(decodedBodyOrRaw);
    } else {
      body = Buffer.from(JSON.stringify(decodedBodyOrRaw), 'utf8');
    }
    this._queue.push({ status, body, headers });
    return this;
  }

  _execute(method, url, headers, data) {
    this.calls.push({ method, url: url.toString(), headers, data });
    if (this._queue.length === 0) {
      return Promise.reject(new Error(`FakeClient: no queued response for ${method} ${url}`));
    }
    return Promise.resolve(this._queue.shift());
  }
}

module.exports = FakeClient;
