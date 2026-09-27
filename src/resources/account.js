'use strict';

const BaseResource = require('./base');

/**
 * Account balance and limits, confirmed senders, sending domains, webhooks.
 * https://dashamail.ru/api/account/
 */
class Account extends BaseResource {
  /** GET /account/balance */
  balance() {
    return this._client.request('GET', '/account/balance');
  }

  /** GET /account/senders — confirmed From: addresses. */
  senders() {
    return this._client.request('GET', '/account/senders');
  }

  /** POST /account/senders/confirm — confirm a sender address with the code emailed to it. */
  confirmSender(email, code) {
    return this._client.request('POST', '/account/senders/confirm', null, { email, code });
  }

  /** GET /account/domains — sending domains. */
  domains(params = {}) {
    return this._client.request('GET', '/account/domains', params);
  }

  /** POST /account/domains — add a sending domain. */
  addDomain(domain, params = {}) {
    return this._client.request('POST', '/account/domains', null, { ...params, domain });
  }

  /** GET /account/domains/check — check DNS (DKIM/SPF) validity of sending domains. */
  checkDomains(params = {}) {
    return this._client.request('GET', '/account/domains/check', params);
  }

  /** DELETE /account/domains/{domain} */
  deleteDomain(domain, params = {}) {
    return this._client.request('DELETE', `/account/domains/${encodeURIComponent(domain)}`, null, params);
  }

  /** GET /account/webhooks — bulk-campaign webhooks. */
  webhooks(params = {}) {
    return this._client.request('GET', '/account/webhooks', params);
  }

  /** POST /account/webhooks — event is one of: open, click, hard, spam, unsub, subscribe, confirm. */
  addWebhook(event, url, params = {}) {
    return this._client.request('POST', '/account/webhooks', null, { ...params, event, url });
  }

  /** DELETE /account/webhooks/{eventName} */
  deleteWebhook(eventName) {
    return this._client.request('DELETE', `/account/webhooks/${encodeURIComponent(eventName)}`);
  }

  /** GET /account/webhooks/transactional */
  transactionalWebhooks(params = {}) {
    return this._client.request('GET', '/account/webhooks/transactional', params);
  }

  /** POST /account/webhooks/transactional — event is one of: send, delivered, dropped, open, click, hard, spam, unsub. */
  addTransactionalWebhook(event, url, params = {}) {
    return this._client.request('POST', '/account/webhooks/transactional', null, { ...params, event, url });
  }

  /** DELETE /account/webhooks/transactional/{eventName} */
  deleteTransactionalWebhook(eventName) {
    return this._client.request('DELETE', `/account/webhooks/transactional/${encodeURIComponent(eventName)}`);
  }
}

module.exports = Account;
