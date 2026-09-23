'use strict';

const BaseResource = require('./base');

/**
 * Address lists (address books), their subscribers and merge fields.
 * https://dashamail.ru/api/lists/
 */
class Lists extends BaseResource {
  /** GET /lists — all address lists, newest first. */
  all(params = {}) {
    return this._client.request('GET', '/lists', params);
  }

  /** GET /lists/{listId} */
  get(listId, params = {}) {
    return this._client.request('GET', `/lists/${listId}`, params);
  }

  /** POST /lists */
  create(name, params = {}) {
    return this._client.request('POST', '/lists', null, { ...params, name });
  }

  /** PUT /lists/{listId} */
  update(listId, params = {}) {
    return this._client.request('PUT', `/lists/${listId}`, null, params);
  }

  /** DELETE /lists/{listId} */
  delete(listId) {
    return this._client.request('DELETE', `/lists/${listId}`);
  }

  // -- Members ------------------------------------------------------------

  /** GET /lists/{listId}/members — start, limit, order, state, email, memberId, segmentId */
  members(listId, params = {}) {
    return this._client.request('GET', `/lists/${listId}/members`, params);
  }

  /** GET /lists/{listId}/members/{email} */
  getMember(listId, email) {
    return this._client.request('GET', `/lists/${listId}/members/${encodeURIComponent(email)}`);
  }

  /** POST /lists/{listId}/members — merge_1..merge_N and the rest go in params. */
  addMember(listId, email, params = {}) {
    return this._client.request('POST', `/lists/${listId}/members`, null, { ...params, email });
  }

  /** POST /lists/{listId}/members/batch — batch is an array of member objects, each at least {email}. */
  addMembersBatch(listId, batch, params = {}) {
    return this._client.request('POST', `/lists/${listId}/members/batch`, null, { ...params, batch });
  }

  /** POST /lists/{listId}/members/import — import subscribers from a file. */
  importMembers(listId, email, type, params = {}) {
    return this._client.request('POST', `/lists/${listId}/members/import`, null, { ...params, email, type });
  }

  /** GET /lists/{listId}/members/import — result of the last import job. */
  getImportResult(listId) {
    return this._client.request('GET', `/lists/${listId}/members/import`);
  }

  /** GET /lists/{listId}/import-history */
  getImportHistory(listId, params = {}) {
    return this._client.request('GET', `/lists/${listId}/import-history`, params);
  }

  /** PUT /lists/{listId}/members/{email} */
  updateMember(listId, email, params = {}) {
    return this._client.request('PUT', `/lists/${listId}/members/${encodeURIComponent(email)}`, null, params);
  }

  /** DELETE /lists/{listId}/members/{email} */
  deleteMember(listId, email, memberId) {
    return this._client.request(
      'DELETE',
      `/lists/${listId}/members/${encodeURIComponent(email)}`,
      null,
      { member_id: memberId }
    );
  }

  /** GET /members — find a subscriber address across every list in the account. */
  findMember(email) {
    return this._client.request('GET', '/members', { email });
  }

  /** POST /lists/{listId}/members/{email}/unsubscribe */
  unsubscribeMember(listId, email, params = {}) {
    return this._client.request(
      'POST',
      `/lists/${listId}/members/${encodeURIComponent(email)}/unsubscribe`,
      null,
      params
    );
  }

  /** POST /lists/{listId}/members/{email}/move — move a subscriber to another list. */
  moveMember(listId, email, toListId, memberId) {
    return this._client.request(
      'POST',
      `/lists/${listId}/members/${encodeURIComponent(email)}/move`,
      null,
      { to_list_id: toListId, member_id: memberId }
    );
  }

  /** POST /lists/{listId}/members/{email}/copy — copy a subscriber to another list. */
  copyMember(listId, email, toListId, memberId) {
    return this._client.request(
      'POST',
      `/lists/${listId}/members/${encodeURIComponent(email)}/copy`,
      null,
      { to_list_id: toListId, member_id: memberId }
    );
  }

  /** GET /lists/{listId}/members/{email}/activity */
  memberActivity(listId, email, params = {}) {
    return this._client.request('GET', `/lists/${listId}/members/${encodeURIComponent(email)}/activity`, params);
  }

  /** GET /lists/{listId}/last-status — current subscription state of an address. */
  lastStatus(listId, email) {
    return this._client.request('GET', `/lists/${listId}/last-status`, { email });
  }

  /** GET /lists/{listId}/check-email — validate an address before subscribing it. */
  checkEmail(listId, email) {
    return this._client.request('GET', `/lists/${listId}/check-email`, { email });
  }

  /** POST /lists/{listId}/clean — purge bounced/complained/unsubscribed members. */
  clean(listId, params = {}) {
    return this._client.request('POST', `/lists/${listId}/clean`, null, params);
  }

  /** GET /lists/{listId}/unsubscribed */
  unsubscribed(listId, params = {}) {
    return this._client.request('GET', `/lists/${listId}/unsubscribed`, params);
  }

  /** GET /lists/{listId}/complaints */
  complaints(listId, params = {}) {
    return this._client.request('GET', `/lists/${listId}/complaints`, params);
  }

  // -- Merge fields --------------------------------------------------------

  /** POST /lists/{listId}/fields — type is one of the merge field types, e.g. "text", "choice". */
  addField(listId, type, params = {}) {
    return this._client.request('POST', `/lists/${listId}/fields`, null, { ...params, type });
  }

  /** PUT /lists/{listId}/fields/{mergeId} */
  updateField(listId, mergeId, params = {}) {
    return this._client.request('PUT', `/lists/${listId}/fields/${mergeId}`, null, { ...params, merge_id: mergeId });
  }

  /** DELETE /lists/{listId}/fields/{mergeId} */
  deleteField(listId, mergeId) {
    return this._client.request('DELETE', `/lists/${listId}/fields/${mergeId}`);
  }
}

module.exports = Lists;
