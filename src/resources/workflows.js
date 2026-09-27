'use strict';

const BaseResource = require('./base');

/**
 * Visual-builder automation scenarios.
 * https://dashamail.ru/api/automations/#workflows
 */
class Workflows extends BaseResource {
  /** GET /workflows */
  all() {
    return this._client.request('GET', '/workflows');
  }

  /** GET /workflows/{workflowId} */
  get(workflowId) {
    return this._client.request('GET', `/workflows/${workflowId}`);
  }

  /** DELETE /workflows/{workflowId} */
  delete(workflowId) {
    return this._client.request('DELETE', `/workflows/${workflowId}`);
  }

  /** POST /workflows/{workflowId}/copy */
  copy(workflowId, params = {}) {
    return this._client.request('POST', `/workflows/${workflowId}/copy`, null, params);
  }
}

module.exports = Workflows;
