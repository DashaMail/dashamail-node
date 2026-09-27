'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const Response = require('./response');
const BinaryResponse = require('./binaryResponse');
const { ApiException, NetworkException } = require('./exceptions');

const DEFAULT_BASE_URL = 'https://api.dashamail.com/v2';
const VERSION = '1.0.0';

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
};

function guessMimeType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

/**
 * Thin HTTP layer over the DashaMail REST API v2 (https://dashamail.ru/api/).
 *
 * Talks JSON over Node's built-in `http`/`https` modules, no third-party
 * dependencies. Resource classes (`./resources/*`) build on top of
 * request()/requestMultipart(); most applications should go through
 * `DashaMail` (../index.js) rather than use this class directly.
 */
class Client {
  /**
   * @param {string} apiKey Account API key — Личный кабинет → Аккаунт → API и интеграции.
   * @param {object} [options]
   * @param {string} [options.baseUrl] Override the API origin, e.g. for a proxy or a mock server.
   * @param {number} [options.timeout] Request timeout in milliseconds. Default 30000.
   * @param {string} [options.userAgent] Override the User-Agent header.
   */
  constructor(apiKey, options = {}) {
    if (typeof apiKey !== 'string' || apiKey === '') {
      throw new TypeError('DashaMail API key must be a non-empty string.');
    }
    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeout = options.timeout || 30000;
    this.userAgent = options.userAgent || `dashamail-node/${VERSION}`;
  }

  /**
   * JSON request. Body is sent as `application/json`; on 2xx the decoded
   * `response.data` is returned wrapped in a Response, on error an
   * ApiException subclass is thrown.
   *
   * @return {Promise<Response|null>} Response normally; null for a 204 No Content.
   */
  async request(method, urlPath, query = null, body = undefined) {
    const url = this._buildUrl(urlPath, query);
    const headers = this._baseHeaders();
    let payload;
    if (body !== undefined) {
      payload = Buffer.from(JSON.stringify(body), 'utf8');
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = String(payload.length);
    }

    const raw = await this._execute(method.toUpperCase(), url, headers, payload);
    return this._parseJsonResponse(raw.status, raw.body, raw.headers);
  }

  /** multipart/form-data request with a single file field — used by POST /images/optimize. */
  async requestMultipart(method, urlPath, query, fields, fileField, filePath, fileName, mimeType) {
    const { body, contentType } = this._buildMultipart(fields, fileField, filePath, fileName, mimeType);
    const url = this._buildUrl(urlPath, query);
    const headers = this._baseHeaders();
    headers['Content-Type'] = contentType;
    headers['Content-Length'] = String(body.length);

    const raw = await this._execute(method.toUpperCase(), url, headers, body);
    return this._parseJsonResponse(raw.status, raw.body, raw.headers);
  }

  /** Same as requestMultipart(), but returns a BinaryResponse instead of decoding JSON. */
  async requestMultipartBinary(method, urlPath, query, fields, fileField, filePath, fileName, mimeType) {
    const { body, contentType } = this._buildMultipart(fields, fileField, filePath, fileName, mimeType);
    const url = this._buildUrl(urlPath, query);
    const headers = this._baseHeaders();
    headers['Content-Type'] = contentType;
    headers['Content-Length'] = String(body.length);

    const raw = await this._execute(method.toUpperCase(), url, headers, body);
    return this._parseBinaryResponse(raw.status, raw.body, raw.headers);
  }

  /** Same as request(), but returns a BinaryResponse instead of decoding JSON. */
  async requestBinary(method, urlPath, query = null, body = undefined) {
    const url = this._buildUrl(urlPath, query);
    const headers = this._baseHeaders();
    let payload;
    if (body !== undefined) {
      payload = Buffer.from(JSON.stringify(body), 'utf8');
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = String(payload.length);
    }

    const raw = await this._execute(method.toUpperCase(), url, headers, payload);
    return this._parseBinaryResponse(raw.status, raw.body, raw.headers);
  }

  _baseHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: 'application/json',
      'User-Agent': this.userAgent,
    };
  }

  _buildUrl(urlPath, query) {
    const url = new URL(this.baseUrl + '/' + String(urlPath).replace(/^\/+/, ''));
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== null && value !== undefined) {
          url.searchParams.set(key, value);
        }
      }
    }
    return url;
  }

  _buildMultipart(fields, fileField, filePath, fileName, mimeType) {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      throw new TypeError(`File not readable: ${filePath}`);
    }
    const resolvedName = fileName || path.basename(filePath);
    const resolvedMime = mimeType || guessMimeType(filePath);
    const fileContent = fs.readFileSync(filePath);
    const boundary = '----DashaMailFormBoundary' + crypto.randomBytes(16).toString('hex');

    const parts = [];
    for (const [key, value] of Object.entries(fields || {})) {
      if (value === null || value === undefined) {
        continue;
      }
      parts.push(Buffer.from(`--${boundary}\r\n`));
      parts.push(Buffer.from(`Content-Disposition: form-data; name="${key}"\r\n\r\n`));
      parts.push(Buffer.from(`${String(value)}\r\n`));
    }
    parts.push(Buffer.from(`--${boundary}\r\n`));
    parts.push(
      Buffer.from(`Content-Disposition: form-data; name="${fileField}"; filename="${resolvedName}"\r\n`)
    );
    parts.push(Buffer.from(`Content-Type: ${resolvedMime}\r\n\r\n`));
    parts.push(fileContent);
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

    return { body: Buffer.concat(parts), contentType: `multipart/form-data; boundary=${boundary}` };
  }

  _parseJsonResponse(status, rawBody, headers) {
    if (status === 204 || !rawBody || rawBody.length === 0) {
      return null;
    }

    let decoded;
    try {
      decoded = JSON.parse(rawBody.toString('utf8'));
    } catch (err) {
      throw new NetworkException(
        `DashaMail API returned a non-JSON response (HTTP ${status}): ${rawBody.toString('utf8').slice(0, 500)}`
      );
    }

    if (status >= 200 && status < 300) {
      const response = decoded && typeof decoded === 'object' && 'response' in decoded ? decoded.response : decoded;
      const data = response && typeof response === 'object' && 'data' in response ? response.data : response;
      const message =
        response && typeof response === 'object' && response.msg && typeof response.msg === 'object'
          ? response.msg.text
          : null;
      const meta = decoded && typeof decoded === 'object' && decoded.meta && typeof decoded.meta === 'object' ? decoded.meta : {};
      return new Response(data, meta, message);
    }

    const error =
      decoded && typeof decoded === 'object' && decoded.error
        ? decoded.error
        : { code: status, message: 'Unknown DashaMail API error' };
    throw ApiException.fromError(status, error);
  }

  _parseBinaryResponse(status, rawBody, headers) {
    if (status >= 200 && status < 300) {
      const contentType = headers['content-type'] || 'application/octet-stream';
      return new BinaryResponse(rawBody, contentType, status);
    }

    let decoded = {};
    try {
      decoded = JSON.parse(rawBody.toString('utf8'));
    } catch (err) {
      decoded = {};
    }
    const error =
      decoded && typeof decoded === 'object' && decoded.error
        ? decoded.error
        : { code: status, message: 'Unknown DashaMail API error' };
    throw ApiException.fromError(status, error);
  }

  /**
   * Low-level HTTP call. Kept as its own method so tests can stub it out
   * without a real network connection — subclass Client and override
   * _execute().
   *
   * @return {Promise<{status: number, body: Buffer, headers: object}>}
   */
  _execute(method, url, headers, body) {
    return new Promise((resolve, reject) => {
      const transport = url.protocol === 'http:' ? http : https;
      const req = transport.request(
        url,
        { method, headers, timeout: this.timeout },
        (res) => {
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => {
            resolve({ status: res.statusCode, body: Buffer.concat(chunks), headers: res.headers });
          });
          res.on('error', (err) => reject(new NetworkException(`Network error: ${err.message}`)));
        }
      );
      req.on('timeout', () => {
        req.destroy(new Error('Request timed out'));
      });
      req.on('error', (err) => {
        reject(new NetworkException(`Network error: ${err.message}`));
      });
      if (body !== undefined) {
        req.write(body);
      }
      req.end();
    });
  }
}

module.exports = Client;
