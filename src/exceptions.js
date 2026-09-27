'use strict';

/**
 * Raised for any error response from the DashaMail API (HTTP status >= 400
 * with a JSON {"error": {"code", "message", "details"}} body).
 *
 * The HTTP status and DashaMail's own error `code` are different numbers:
 * `code` is stable across API versions and documented at
 * https://dashamail.ru/api/errors/, while the HTTP status is a coarser
 * REST-ification of it.
 */
class ApiException extends Error {
  constructor(message, httpStatus, apiCode = 0, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.httpStatus = httpStatus;
    this.apiCode = apiCode;
    this.details = details || {};
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /** Build the most specific exception subclass for a given HTTP status. */
  static fromError(httpStatus, error) {
    const err = error && typeof error === 'object' ? error : {};
    const message = String(err.message || 'DashaMail API error');
    const parsedCode = Number(err.code);
    const apiCode = Number.isFinite(parsedCode) ? parsedCode : httpStatus;
    const details = err.details && typeof err.details === 'object' ? err.details : {};

    const ExceptionClass =
      STATUS_TO_EXCEPTION[httpStatus] || (httpStatus >= 500 ? ServerException : ApiException);
    return new ExceptionClass(message, httpStatus, apiCode, details);
  }
}

/** HTTP 401 — missing or invalid API key. */
class AuthenticationException extends ApiException {}

/** HTTP 402 — the account's balance or plan does not allow this action. */
class PaymentRequiredException extends ApiException {}

/** HTTP 403 — the API key is valid but lacks the rights or scope for this action. */
class AuthorizationException extends ApiException {}

/** HTTP 404 — the resource (or the account itself) does not exist. */
class NotFoundException extends ApiException {}

/** HTTP 409 — the request conflicts with the resource's current state. */
class ConflictException extends ApiException {}

/** HTTP 413 — the uploaded file or attachment is too large. */
class PayloadTooLargeException extends ApiException {}

/** HTTP 422 — a required field is missing or a value is invalid. */
class ValidationException extends ApiException {}

/** HTTP 429 — too many requests. See getRetryAfter() for how long to back off. */
class RateLimitException extends ApiException {
  getRetryAfter() {
    const value = this.details ? this.details.retry_after : undefined;
    return value !== undefined && value !== null ? Number(value) : null;
  }
}

/** HTTP 5xx — something failed on DashaMail's side. Usually safe to retry. */
class ServerException extends ApiException {}

/** The request never got an HTTP response (DNS, TLS, timeout, connection reset...). */
class NetworkException extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkException';
  }
}

const STATUS_TO_EXCEPTION = {
  401: AuthenticationException,
  402: PaymentRequiredException,
  403: AuthorizationException,
  404: NotFoundException,
  409: ConflictException,
  413: PayloadTooLargeException,
  422: ValidationException,
  429: RateLimitException,
};

module.exports = {
  ApiException,
  AuthenticationException,
  PaymentRequiredException,
  AuthorizationException,
  NotFoundException,
  ConflictException,
  PayloadTooLargeException,
  ValidationException,
  RateLimitException,
  ServerException,
  NetworkException,
};
