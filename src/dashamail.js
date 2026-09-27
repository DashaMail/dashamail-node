'use strict';

const Client = require('./client');
const {
  Account,
  Automations,
  Campaigns,
  Dialogs,
  Images,
  Lists,
  Reports,
  Router,
  Segments,
  Templates,
  Transactional,
  Workflows,
} = require('./resources');

/**
 * Entry point of the DashaMail Node.js SDK.
 *
 *   const dashamail = new DashaMail('YOUR_API_KEY');
 *   const lists = await dashamail.lists.all();
 *   await dashamail.transactional.send('user@example.com', 'sender@yourdomain.com', '<p>Hi!</p>');
 */
class DashaMail {
  /**
   * @param {string} apiKey Account API key — Личный кабинет → Аккаунт → API и интеграции.
   * @param {object} [options] See Client for baseUrl/timeout/userAgent.
   */
  constructor(apiKey, options = {}) {
    this.client = new Client(apiKey, options);

    this.lists = new Lists(this.client);
    this.segments = new Segments(this.client);
    this.campaigns = new Campaigns(this.client);
    this.automations = new Automations(this.client);
    this.workflows = new Workflows(this.client);
    this.templates = new Templates(this.client);
    this.reports = new Reports(this.client);
    this.transactional = new Transactional(this.client);
    this.account = new Account(this.client);
    this.dialogs = new Dialogs(this.client);
    this.router = new Router(this.client);
    this.images = new Images(this.client);
  }
}

module.exports = DashaMail;
