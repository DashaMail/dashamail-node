'use strict';

const BaseResource = require('./base');

/**
 * One-off transactional emails: send, status, log, stats.
 * Requires a verified sending domain — see Account.addDomain().
 * https://dashamail.ru/api/transactional/
 */
class Transactional extends BaseResource {
  /**
   * POST /transactional/messages
   * @param {string|string[]} to A single address, or an array of addresses/objects.
   * @param {string} fromEmail Verified sending address.
   * @param {string} message HTML body.
   * @param {object} [params] fromName, subject, plainText, messageId, cc, bcc, headers,
   *                          attachments, inline, deliveryTime, domain, statDomain...
   */
  send(to, fromEmail, message, params = {}) {
    return this._client.request('POST', '/transactional/messages', null, {
      ...params,
      to,
      from_email: fromEmail,
      message,
    });
  }

  /** GET /transactional/messages/{transactionId} — delivery status of one message. */
  check(transactionId) {
    return this._client.request('GET', `/transactional/messages/${encodeURIComponent(transactionId)}`);
  }

  /** GET /transactional/log */
  log(params = {}) {
    return this._client.request('GET', '/transactional/log', params);
  }

  /** GET /transactional/stats */
  stats(params = {}) {
    return this._client.request('GET', '/transactional/stats', params);
  }
}

module.exports = Transactional;
