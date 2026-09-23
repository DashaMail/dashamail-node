'use strict';

const BaseResource = require('./base');

/**
 * Campaign statistics: sent/delivered/opened/clicked/bounced, click and bounce
 * breakdowns, geography, mail clients, event feed, A/B test results.
 * https://dashamail.ru/api/reports/
 */
class Reports extends BaseResource {
  /** GET /reports/{campaignId}/summary */
  summary(campaignId, params = {}) {
    return this._client.request('GET', `/reports/${campaignId}/summary`, params);
  }

  /** GET /reports/{campaignId}/timeline — metric values bucketed over time. */
  timeline(campaignId, params = {}) {
    return this._client.request('GET', `/reports/${campaignId}/timeline`, params);
  }

  /** GET /reports/{campaignId}/variants — A/B test results. */
  ab(campaignId) {
    return this._client.request('GET', `/reports/${campaignId}/variants`);
  }

  /** POST /reports/compare — compare metrics across periods/campaigns/lists. */
  compare(periods, params = {}) {
    return this._client.request('POST', '/reports/compare', null, { ...params, periods });
  }

  /** GET /reports/{campaignId}/{metric} — recipient list for one event. */
  metric(campaignId, metric, params = {}) {
    return this._client.request('GET', `/reports/${campaignId}/${metric}`, params);
  }

  /** GET /reports/{campaignId}/sent */
  sent(campaignId, params = {}) {
    return this.metric(campaignId, 'sent', params);
  }

  /** GET /reports/{campaignId}/delivered */
  delivered(campaignId, params = {}) {
    return this.metric(campaignId, 'delivered', params);
  }

  /** GET /reports/{campaignId}/opened */
  opened(campaignId, params = {}) {
    return this.metric(campaignId, 'opened', params);
  }

  /** GET /reports/{campaignId}/clicked */
  clicked(campaignId, params = {}) {
    return this.metric(campaignId, 'clicked', params);
  }

  /** GET /reports/{campaignId}/bounced */
  bounced(campaignId, params = {}) {
    return this.metric(campaignId, 'bounced', params);
  }

  /** GET /reports/{campaignId}/complained */
  complained(campaignId, params = {}) {
    return this.metric(campaignId, 'complained', params);
  }

  /** GET /reports/{campaignId}/unsubscribed */
  unsubscribed(campaignId, params = {}) {
    return this.metric(campaignId, 'unsubscribed', params);
  }

  /** GET /reports/{campaignId}/events — full event feed with filters. */
  events(campaignId, params = {}) {
    return this._client.request('GET', `/reports/${campaignId}/events`, params);
  }

  /** GET /reports/{campaignId}/clickstat — clicks broken down by link. */
  clickstat(campaignId) {
    return this._client.request('GET', `/reports/${campaignId}/clickstat`);
  }

  /** GET /reports/{campaignId}/userclicks — who clicked a specific link. */
  userclicks(campaignId, url) {
    return this._client.request('GET', `/reports/${campaignId}/userclicks`, { url });
  }

  /** GET /reports/{campaignId}/bouncestat — bounces broken down by SMTP code. */
  bouncestat(campaignId) {
    return this._client.request('GET', `/reports/${campaignId}/bouncestat`);
  }

  /** GET /reports/{campaignId}/domains — metrics broken down by recipient mail domain. */
  domains(campaignId, params = {}) {
    return this._client.request('GET', `/reports/${campaignId}/domains`, params);
  }

  /** GET /reports/{campaignId}/geo — geography of opens. */
  geo(campaignId) {
    return this._client.request('GET', `/reports/${campaignId}/geo`);
  }

  /** GET /reports/{campaignId}/clients — mail clients and devices. */
  clients(campaignId) {
    return this._client.request('GET', `/reports/${campaignId}/clients`);
  }

  /** GET /reports/{campaignId}/codes — confirmation codes. */
  codes(campaignId, params = {}) {
    return this._client.request('GET', `/reports/${campaignId}/codes`, params);
  }
}

module.exports = Reports;
