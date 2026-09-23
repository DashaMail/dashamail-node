'use strict';

const BaseResource = require('./base');

/**
 * Bulk campaigns: draft, build, launch, pause, A/B tests, attachments, folders.
 * https://dashamail.ru/api/campaigns/
 */
class Campaigns extends BaseResource {
  /** GET /campaigns */
  all(params = {}) {
    return this._client.request('GET', '/campaigns', params);
  }

  /** GET /campaigns/{campaignId} */
  get(campaignId, params = {}) {
    return this._client.request('GET', `/campaigns/${campaignId}`, params);
  }

  /** POST /campaigns — requires listId, subject, fromEmail, fromName; see the API docs for the rest. */
  create(params) {
    return this._client.request('POST', '/campaigns', null, params);
  }

  /** PUT /campaigns/{campaignId} */
  update(campaignId, params = {}) {
    return this._client.request('PUT', `/campaigns/${campaignId}`, null, params);
  }

  /** DELETE /campaigns/{campaignId} */
  delete(campaignId) {
    return this._client.request('DELETE', `/campaigns/${campaignId}`);
  }

  /** POST /campaigns/{campaignId}/copy */
  copy(campaignId, params = {}) {
    return this._client.request('POST', `/campaigns/${campaignId}/copy`, null, params);
  }

  /** POST /campaigns/{campaignId}/pause */
  pause(campaignId) {
    return this._client.request('POST', `/campaigns/${campaignId}/pause`);
  }

  /** POST /campaigns/{campaignId}/resume */
  resume(campaignId) {
    return this._client.request('POST', `/campaigns/${campaignId}/resume`);
  }

  /** POST /campaigns/{campaignId}/schedule */
  schedule(campaignId, deliveryTime, params = {}) {
    return this._client.request('POST', `/campaigns/${campaignId}/schedule`, null, {
      ...params,
      delivery_time: deliveryTime,
    });
  }

  /** POST /campaigns/{campaignId}/send — send a draft right now. */
  send(campaignId) {
    return this._client.request('POST', `/campaigns/${campaignId}/send`);
  }

  /** POST /campaigns/{campaignId}/unschedule — pull a scheduled campaign back to DRAFT. */
  unschedule(campaignId) {
    return this._client.request('POST', `/campaigns/${campaignId}/unschedule`);
  }

  /** POST /campaigns/{campaignId}/test — send a test copy to your own address. */
  test(campaignId, email) {
    return this._client.request('POST', `/campaigns/${campaignId}/test`, null, { email });
  }

  /** GET /campaigns/{campaignId}/preview — browser preview link. */
  preview(campaignId) {
    return this._client.request('GET', `/campaigns/${campaignId}/preview`);
  }

  /** GET /campaigns/{campaignId}/estimate — how many emails would be sent. */
  estimate(campaignId) {
    return this._client.request('GET', `/campaigns/${campaignId}/estimate`);
  }

  /** POST /campaigns/{campaignId}/resend — resend to recipients who did not open. */
  resend(campaignId, params = {}) {
    return this._client.request('POST', `/campaigns/${campaignId}/resend`, null, params);
  }

  /** GET /campaigns/{campaignId}/attachments */
  getAttachments(campaignId) {
    return this._client.request('GET', `/campaigns/${campaignId}/attachments`);
  }

  /** POST /campaigns/{campaignId}/attachments — attach a file by URL. */
  addAttachment(campaignId, url, params = {}) {
    return this._client.request('POST', `/campaigns/${campaignId}/attachments`, null, { ...params, url });
  }

  /** DELETE /campaigns/{campaignId}/attachments/{id} */
  deleteAttachment(campaignId, attachmentId) {
    return this._client.request('DELETE', `/campaigns/${campaignId}/attachments/${attachmentId}`);
  }

  /** GET /campaigns/folders */
  getFolders(params = {}) {
    return this._client.request('GET', '/campaigns/folders', params);
  }

  /** POST /campaigns/{campaignId}/move — move a campaign into a folder. */
  moveToFolder(campaignId, folderId) {
    return this._client.request('POST', `/campaigns/${campaignId}/move`, null, { folder_id: folderId });
  }

  // -- A/B testing ----------------------------------------------------------

  /** POST /campaigns/{campaignId}/ab — turn a draft into an A/B test. */
  createAb(campaignId, params = {}) {
    return this._client.request('POST', `/campaigns/${campaignId}/ab`, null, params);
  }

  /** GET /campaigns/{campaignId}/ab */
  getAb(campaignId) {
    return this._client.request('GET', `/campaigns/${campaignId}/ab`);
  }

  /** PUT /campaigns/{campaignId}/ab */
  updateAb(campaignId, params = {}) {
    return this._client.request('PUT', `/campaigns/${campaignId}/ab`, null, params);
  }

  /** DELETE /campaigns/{campaignId}/ab — dismantle the A/B test back into a plain campaign. */
  deleteAb(campaignId) {
    return this._client.request('DELETE', `/campaigns/${campaignId}/ab`);
  }

  /** POST /campaigns/{campaignId}/ab/winner — pick the winning variant and schedule the rest. */
  abWinner(campaignId, variantId, deliveryTime) {
    return this._client.request('POST', `/campaigns/${campaignId}/ab/winner`, null, {
      variant_id: variantId,
      delivery_time: deliveryTime,
    });
  }

  /** DELETE /campaigns/{campaignId}/ab/winner — cancel a previously chosen winner. */
  cancelAbWinner(campaignId) {
    return this._client.request('DELETE', `/campaigns/${campaignId}/ab/winner`);
  }
}

module.exports = Campaigns;
