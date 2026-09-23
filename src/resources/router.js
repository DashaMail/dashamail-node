'use strict';

const BaseResource = require('./base');

/**
 * Inbound mail processing: receiving domains, routing rules, stored
 * messages, webhook delivery log.
 * https://dashamail.ru/api/router/
 */
class Router extends BaseResource {
  // -- Domains --------------------------------------------------------------

  /** GET /router/domains */
  domains() {
    return this._client.request('GET', '/router/domains');
  }

  /** POST /router/domains — connect your own inbound domain (needs an MX record). */
  createDomain(domain) {
    return this._client.request('POST', '/router/domains', null, { domain });
  }

  /** POST /router/domains/{domainId}/verify — check the MX record. */
  verifyDomain(domainId) {
    return this._client.request('POST', `/router/domains/${domainId}/verify`);
  }

  /** DELETE /router/domains/{domainId} */
  deleteDomain(domainId) {
    return this._client.request('DELETE', `/router/domains/${domainId}`);
  }

  /** GET /router/domains/mx — DNS records to configure. */
  mxInstructions() {
    return this._client.request('GET', '/router/domains/mx');
  }

  // -- Routes ---------------------------------------------------------------

  /** GET /router/routes */
  routes() {
    return this._client.request('GET', '/router/routes');
  }

  /** GET /router/routes/{routeId} */
  getRoute(routeId) {
    return this._client.request('GET', `/router/routes/${routeId}`);
  }

  /** POST /router/routes — actions is 1..5 action objects, each with a "type" key (webhook, store, forward, stop). */
  createRoute(actions, params = {}) {
    return this._client.request('POST', '/router/routes', null, { ...params, actions });
  }

  /** PUT /router/routes/{routeId} */
  updateRoute(routeId, params = {}) {
    return this._client.request('PUT', `/router/routes/${routeId}`, null, params);
  }

  /** DELETE /router/routes/{routeId} */
  deleteRoute(routeId) {
    return this._client.request('DELETE', `/router/routes/${routeId}`);
  }

  /** POST /router/routes/{routeId}/rekey — reissue the webhook signing key. */
  rekeyRoute(routeId) {
    return this._client.request('POST', `/router/routes/${routeId}/rekey`);
  }

  /** POST /router/routes/reorder — order is an array of route ids in the desired priority order. */
  reorderRoutes(order) {
    return this._client.request('POST', '/router/routes/reorder', null, { order });
  }

  // -- Stored messages --------------------------------------------------

  /** GET /router/messages */
  messages(params = {}) {
    return this._client.request('GET', '/router/messages', params);
  }

  /** GET /router/messages/{messageId} */
  getMessage(messageId) {
    return this._client.request('GET', `/router/messages/${messageId}`);
  }

  /** DELETE /router/messages/{messageId} */
  deleteMessage(messageId) {
    return this._client.request('DELETE', `/router/messages/${messageId}`);
  }

  /** GET /router/messages/{messageId}/attachments/{attachmentId} */
  getMessageAttachment(messageId, attachmentId) {
    return this._client.request('GET', `/router/messages/${messageId}/attachments/${attachmentId}`);
  }

  // -- Webhook delivery log ------------------------------------------------

  /** GET /router/deliveries */
  deliveries(params = {}) {
    return this._client.request('GET', '/router/deliveries', params);
  }

  /** GET /router/deliveries/{deliveryId} */
  getDelivery(deliveryId) {
    return this._client.request('GET', `/router/deliveries/${deliveryId}`);
  }

  // -- Settings ---------------------------------------------------------------

  /** GET /router/settings */
  settings() {
    return this._client.request('GET', '/router/settings');
  }

  /** PUT /router/settings — passAutoreply, passListMail */
  updateSettings(params) {
    return this._client.request('PUT', '/router/settings', null, params);
  }
}

module.exports = Router;
