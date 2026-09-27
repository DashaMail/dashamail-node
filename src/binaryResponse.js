'use strict';

const fs = require('fs');

/**
 * Raw bytes returned by an endpoint that can answer outside JSON —
 * currently only `POST /images/optimize?response=binary`.
 */
class BinaryResponse {
  constructor(body, contentType, httpStatus) {
    this.body = body;
    this.contentType = contentType;
    this.httpStatus = httpStatus;
  }

  /** Write the bytes to a file. Returns the number of bytes written. */
  saveTo(filePath) {
    fs.writeFileSync(filePath, this.body);
    return this.body.length;
  }
}

module.exports = BinaryResponse;
