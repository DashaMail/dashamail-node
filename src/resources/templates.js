'use strict';

const BaseResource = require('./base');

/**
 * Saved markup: legacy HTML-template store (/templates) plus saved campaigns
 * in TEMPLATE status (/templates/saved), which is where the account UI keeps them.
 * https://dashamail.ru/api/templates/
 */
class Templates extends BaseResource {
  /** GET /templates — legacy HTML templates. */
  all(params = {}) {
    return this._client.request('GET', '/templates', params);
  }

  /** GET /templates/{id} */
  get(id) {
    return this._client.request('GET', `/templates/${id}`);
  }

  /** POST /templates — template is HTML markup, body is the plain-text markup. */
  create(name, template, body, params = {}) {
    return this._client.request('POST', '/templates', null, { ...params, name, template, body });
  }

  /** PUT /templates/{id} */
  update(id, params = {}) {
    return this._client.request('PUT', `/templates/${id}`, null, params);
  }

  /** DELETE /templates/{id} */
  delete(id) {
    return this._client.request('DELETE', `/templates/${id}`);
  }

  /** GET /templates/saved — campaigns saved as reusable templates (status TEMPLATE). */
  saved(params = {}) {
    return this._client.request('GET', '/templates/saved', params);
  }
}

module.exports = Templates;
