'use strict';

const BaseResource = require('./base');

/**
 * Event-triggered emails (subscribe, add, open, click, field change...).
 * https://dashamail.ru/api/automations/
 */
class Automations extends BaseResource {
  /** GET /automations/events — reference of available trigger events. */
  events() {
    return this._client.request('GET', '/automations/events');
  }

  /** GET /automations */
  all(params = {}) {
    return this._client.request('GET', '/automations', params);
  }

  /** POST /automations — requires listId, subject, fromEmail, fromName; see the API docs for the rest. */
  create(params) {
    return this._client.request('POST', '/automations', null, params);
  }

  /** PUT /automations/{campaignId} */
  update(campaignId, params = {}) {
    return this._client.request('PUT', `/automations/${campaignId}`, null, params);
  }

  /** DELETE /automations/{campaignId} */
  delete(campaignId) {
    return this._client.request('DELETE', `/automations/${campaignId}`);
  }

  /** POST /automations/{campaignId}/trigger — force-run for one subscriber (fails with code 37 before moderation). */
  trigger(campaignId, email, params = {}) {
    return this._client.request('POST', `/automations/${campaignId}/trigger`, null, { ...params, email });
  }
}

module.exports = Automations;
