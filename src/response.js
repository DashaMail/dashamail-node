'use strict';

/**
 * Wraps the `data` payload of a successful API call together with its
 * `meta` (pagination info) and the human-readable `msg.text` DashaMail sent.
 *
 * `response.data` holds the raw payload; the instance is also iterable with
 * `for...of` when the payload is a list, e.g.:
 *
 *   const members = await dashamail.lists.members(listId);
 *   for (const member of members) { console.log(member.email); }
 *   console.log(members.data[0].email);
 *
 * Paginated endpoints (`members()` and friends) additionally expose
 * hasMore()/getLimit() taken from the `meta` object DashaMail returns
 * instead of a total count.
 */
class Response {
  constructor(data, meta = {}, message = null) {
    this.data = data;
    this.meta = meta || {};
    this.message = message;
  }

  /** True when a paginated listing has more rows beyond the returned page. */
  hasMore() {
    return Boolean(this.meta && this.meta.has_more);
  }

  /** The effective page size DashaMail used to answer a paginated listing. */
  getLimit() {
    const limit = this.meta ? this.meta.limit : undefined;
    return limit !== undefined && limit !== null ? Number(limit) : null;
  }

  [Symbol.iterator]() {
    const data = Array.isArray(this.data) ? this.data : [];
    return data[Symbol.iterator]();
  }

  get length() {
    if (Array.isArray(this.data)) {
      return this.data.length;
    }
    return this.data === null || this.data === undefined ? 0 : 1;
  }

  toJSON() {
    return this.data;
  }
}

module.exports = Response;
