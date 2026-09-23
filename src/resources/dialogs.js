'use strict';

const BaseResource = require('./base');

/**
 * Subscriber replies to campaigns, threaded per subscriber.
 * https://dashamail.ru/api/dialogs/
 */
class Dialogs extends BaseResource {
  /** GET /dialogs */
  all(params = {}) {
    return this._client.request('GET', '/dialogs', params);
  }

  /** GET /dialogs/{dialogId} */
  get(dialogId) {
    return this._client.request('GET', `/dialogs/${dialogId}`);
  }

  /** GET /dialogs/{dialogId}/messages */
  messages(dialogId, params = {}) {
    return this._client.request('GET', `/dialogs/${dialogId}/messages`, params);
  }

  /** POST /dialogs/{dialogId}/reply — reply as the campaign's sender. */
  reply(dialogId, bodyText, params = {}) {
    return this._client.request('POST', `/dialogs/${dialogId}/reply`, null, { ...params, body_text: bodyText });
  }

  /** POST /dialogs/{dialogId}/read */
  markRead(dialogId, params = {}) {
    return this._client.request('POST', `/dialogs/${dialogId}/read`, null, params);
  }

  /** POST /dialogs/{dialogId}/unread */
  markUnread(dialogId) {
    return this._client.request('POST', `/dialogs/${dialogId}/unread`);
  }

  /** POST /dialogs/{dialogId}/close */
  close(dialogId) {
    return this._client.request('POST', `/dialogs/${dialogId}/close`);
  }

  /** POST /dialogs/{dialogId}/open */
  open(dialogId) {
    return this._client.request('POST', `/dialogs/${dialogId}/open`);
  }

  /** GET /dialogs/unread-count */
  unreadCount() {
    return this._client.request('GET', '/dialogs/unread-count');
  }

  /** GET /dialogs/attachments/{attachmentId} — link to a reply's attachment. */
  attachment(attachmentId) {
    return this._client.request('GET', `/dialogs/attachments/${attachmentId}`);
  }
}

module.exports = Dialogs;
