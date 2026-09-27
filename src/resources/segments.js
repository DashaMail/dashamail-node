'use strict';

const BaseResource = require('./base');

/**
 * Saved subscriber segments: condition sets, field/operator reference, size counting.
 * https://dashamail.ru/api/segments/
 */
class Segments extends BaseResource {
  /** GET /segments */
  all(params = {}) {
    return this._client.request('GET', '/segments', params);
  }

  /** GET /segments/{segmentId} */
  get(segmentId) {
    return this._client.request('GET', `/segments/${segmentId}`);
  }

  /** POST /segments — esegment is a condition tree, e.g. {match: "all", c: [...]}. */
  create(listId, name, esegment, params = {}) {
    return this._client.request('POST', '/segments', null, { ...params, list_id: listId, name, esegment });
  }

  /** PUT /segments/{segmentId} */
  update(segmentId, params = {}) {
    return this._client.request('PUT', `/segments/${segmentId}`, null, params);
  }

  /** DELETE /segments/{segmentId} */
  delete(segmentId) {
    return this._client.request('DELETE', `/segments/${segmentId}`);
  }

  /** POST /segments/count — recompute a segment's size, by id or by passing listId + esegment directly. */
  count(params = {}) {
    return this._client.request('POST', '/segments/count', null, params);
  }

  /** GET /segments/fields — which fields/operators are available for a list's segments. */
  fields(listId) {
    return this._client.request('GET', '/segments/fields', { list_id: listId });
  }
}

module.exports = Segments;
