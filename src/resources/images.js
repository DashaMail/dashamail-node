'use strict';

const BaseResource = require('./base');

/**
 * Resize (>1600px wide) and recompress an image the same way DashaMail's own
 * file manager does, without changing its format or storing anything.
 * https://dashamail.ru/api/images/
 */
class Images extends BaseResource {
  /**
   * Optimize an image already loaded in memory (JSON body, base64-encoded).
   *
   * @param {Buffer} binaryData Raw image bytes (JPEG/PNG/GIF).
   * @param {object} [params] resize (bool, default true), maxWidth (int), lossy (bool).
   * @return {Promise<import('../response')>} data.image is the base64-encoded result.
   */
  optimize(binaryData, params = {}) {
    return this._client.request('POST', '/images/optimize', null, {
      ...params,
      image: Buffer.from(binaryData).toString('base64'),
    });
  }

  /** Optimize an image already sitting on disk, uploaded as multipart/form-data. */
  optimizeFile(filePath, params = {}) {
    return this._client.requestMultipart('POST', '/images/optimize', null, params, 'file', filePath);
  }

  /** Same as optimizeFile(), but returns raw optimized bytes (?response=binary). */
  optimizeFileBinary(filePath, params = {}) {
    return this._client.requestMultipartBinary(
      'POST',
      '/images/optimize',
      { response: 'binary' },
      params,
      'file',
      filePath
    );
  }

  /** Same as optimize(), but returns raw optimized bytes (?response=binary). */
  optimizeBinary(binaryData, params = {}) {
    return this._client.requestBinary('POST', '/images/optimize', { response: 'binary' }, {
      ...params,
      image: Buffer.from(binaryData).toString('base64'),
    });
  }
}

module.exports = Images;
