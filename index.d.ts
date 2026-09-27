// Type definitions for @dashamail/node

export type Params = Record<string, any>;

export class Response<T = any> implements Iterable<any> {
  data: T;
  meta: Record<string, any>;
  message: string | null;
  constructor(data: T, meta?: Record<string, any>, message?: string | null);
  hasMore(): boolean;
  getLimit(): number | null;
  readonly length: number;
  [Symbol.iterator](): Iterator<any>;
  toJSON(): T;
}

export class BinaryResponse {
  body: Buffer;
  contentType: string;
  httpStatus: number;
  constructor(body: Buffer, contentType: string, httpStatus: number);
  saveTo(filePath: string): number;
}

export class ApiException extends Error {
  httpStatus: number;
  apiCode: number;
  details: Record<string, any>;
  constructor(message: string, httpStatus: number, apiCode?: number, details?: Record<string, any>);
  static fromError(httpStatus: number, error: Record<string, any>): ApiException;
}
export class AuthenticationException extends ApiException {}
export class PaymentRequiredException extends ApiException {}
export class AuthorizationException extends ApiException {}
export class NotFoundException extends ApiException {}
export class ConflictException extends ApiException {}
export class PayloadTooLargeException extends ApiException {}
export class ValidationException extends ApiException {}
export class RateLimitException extends ApiException {
  getRetryAfter(): number | null;
}
export class ServerException extends ApiException {}
export class NetworkException extends Error {}

export interface ClientOptions {
  baseUrl?: string;
  timeout?: number;
  userAgent?: string;
}

export class Client {
  constructor(apiKey: string, options?: ClientOptions);
  request(method: string, path: string, query?: Params | null, body?: any): Promise<Response | null>;
  requestMultipart(
    method: string,
    path: string,
    query: Params | null,
    fields: Params,
    fileField: string,
    filePath: string,
    fileName?: string,
    mimeType?: string
  ): Promise<Response | null>;
  requestMultipartBinary(
    method: string,
    path: string,
    query: Params | null,
    fields: Params,
    fileField: string,
    filePath: string,
    fileName?: string,
    mimeType?: string
  ): Promise<BinaryResponse>;
  requestBinary(method: string, path: string, query?: Params | null, body?: any): Promise<BinaryResponse>;
}

export class Lists {
  all(params?: Params): Promise<Response>;
  get(listId: number | string, params?: Params): Promise<Response>;
  create(name: string, params?: Params): Promise<Response>;
  update(listId: number | string, params?: Params): Promise<Response>;
  delete(listId: number | string): Promise<null>;
  members(listId: number | string, params?: Params): Promise<Response>;
  getMember(listId: number | string, email: string): Promise<Response>;
  addMember(listId: number | string, email: string, params?: Params): Promise<Response>;
  addMembersBatch(listId: number | string, batch: Params[], params?: Params): Promise<Response>;
  importMembers(listId: number | string, email: string, type: string, params?: Params): Promise<Response>;
  getImportResult(listId: number | string): Promise<Response>;
  getImportHistory(listId: number | string, params?: Params): Promise<Response>;
  updateMember(listId: number | string, email: string, params?: Params): Promise<Response>;
  deleteMember(listId: number | string, email: string, memberId: number | string): Promise<null>;
  findMember(email: string): Promise<Response>;
  unsubscribeMember(listId: number | string, email: string, params?: Params): Promise<Response>;
  moveMember(listId: number | string, email: string, toListId: number | string, memberId: number | string): Promise<Response>;
  copyMember(listId: number | string, email: string, toListId: number | string, memberId: number | string): Promise<Response>;
  memberActivity(listId: number | string, email: string, params?: Params): Promise<Response>;
  lastStatus(listId: number | string, email: string): Promise<Response>;
  checkEmail(listId: number | string, email: string): Promise<Response>;
  clean(listId: number | string, params?: Params): Promise<Response>;
  unsubscribed(listId: number | string, params?: Params): Promise<Response>;
  complaints(listId: number | string, params?: Params): Promise<Response>;
  addField(listId: number | string, type: string, params?: Params): Promise<Response>;
  updateField(listId: number | string, mergeId: number | string, params?: Params): Promise<Response>;
  deleteField(listId: number | string, mergeId: number | string): Promise<null>;
}

export class Segments {
  all(params?: Params): Promise<Response>;
  get(segmentId: number | string): Promise<Response>;
  create(listId: number | string, name: string, esegment: Params, params?: Params): Promise<Response>;
  update(segmentId: number | string, params?: Params): Promise<Response>;
  delete(segmentId: number | string): Promise<null>;
  count(params?: Params): Promise<Response>;
  fields(listId: number | string): Promise<Response>;
}

export class Campaigns {
  all(params?: Params): Promise<Response>;
  get(campaignId: number | string, params?: Params): Promise<Response>;
  create(params: Params): Promise<Response>;
  update(campaignId: number | string, params?: Params): Promise<Response>;
  delete(campaignId: number | string): Promise<null>;
  copy(campaignId: number | string, params?: Params): Promise<Response>;
  pause(campaignId: number | string): Promise<Response>;
  resume(campaignId: number | string): Promise<Response>;
  schedule(campaignId: number | string, deliveryTime: string, params?: Params): Promise<Response>;
  send(campaignId: number | string): Promise<Response>;
  unschedule(campaignId: number | string): Promise<Response>;
  test(campaignId: number | string, email: string): Promise<Response>;
  preview(campaignId: number | string): Promise<Response>;
  estimate(campaignId: number | string): Promise<Response>;
  resend(campaignId: number | string, params?: Params): Promise<Response>;
  getAttachments(campaignId: number | string): Promise<Response>;
  addAttachment(campaignId: number | string, url: string, params?: Params): Promise<Response>;
  deleteAttachment(campaignId: number | string, attachmentId: number | string): Promise<null>;
  getFolders(params?: Params): Promise<Response>;
  moveToFolder(campaignId: number | string, folderId: number | string): Promise<Response>;
  createAb(campaignId: number | string, params?: Params): Promise<Response>;
  getAb(campaignId: number | string): Promise<Response>;
  updateAb(campaignId: number | string, params?: Params): Promise<Response>;
  deleteAb(campaignId: number | string): Promise<null>;
  abWinner(campaignId: number | string, variantId: number | string, deliveryTime: string): Promise<Response>;
  cancelAbWinner(campaignId: number | string): Promise<null>;
}

export class Automations {
  events(): Promise<Response>;
  all(params?: Params): Promise<Response>;
  create(params: Params): Promise<Response>;
  update(campaignId: number | string, params?: Params): Promise<Response>;
  delete(campaignId: number | string): Promise<null>;
  trigger(campaignId: number | string, email: string, params?: Params): Promise<Response>;
}

export class Workflows {
  all(): Promise<Response>;
  get(workflowId: number | string): Promise<Response>;
  delete(workflowId: number | string): Promise<null>;
  copy(workflowId: number | string, params?: Params): Promise<Response>;
}

export class Templates {
  all(params?: Params): Promise<Response>;
  get(id: number | string): Promise<Response>;
  create(name: string, template: string, body: string, params?: Params): Promise<Response>;
  update(id: number | string, params?: Params): Promise<Response>;
  delete(id: number | string): Promise<null>;
  saved(params?: Params): Promise<Response>;
}

export class Reports {
  summary(campaignId: number | string, params?: Params): Promise<Response>;
  timeline(campaignId: number | string, params?: Params): Promise<Response>;
  ab(campaignId: number | string): Promise<Response>;
  compare(periods: Params[], params?: Params): Promise<Response>;
  metric(campaignId: number | string, metric: string, params?: Params): Promise<Response>;
  sent(campaignId: number | string, params?: Params): Promise<Response>;
  delivered(campaignId: number | string, params?: Params): Promise<Response>;
  opened(campaignId: number | string, params?: Params): Promise<Response>;
  clicked(campaignId: number | string, params?: Params): Promise<Response>;
  bounced(campaignId: number | string, params?: Params): Promise<Response>;
  complained(campaignId: number | string, params?: Params): Promise<Response>;
  unsubscribed(campaignId: number | string, params?: Params): Promise<Response>;
  events(campaignId: number | string, params?: Params): Promise<Response>;
  clickstat(campaignId: number | string): Promise<Response>;
  userclicks(campaignId: number | string, url: string): Promise<Response>;
  bouncestat(campaignId: number | string): Promise<Response>;
  domains(campaignId: number | string, params?: Params): Promise<Response>;
  geo(campaignId: number | string): Promise<Response>;
  clients(campaignId: number | string): Promise<Response>;
  codes(campaignId: number | string, params?: Params): Promise<Response>;
}

export class Transactional {
  send(to: string | string[], fromEmail: string, message: string, params?: Params): Promise<Response>;
  check(transactionId: string): Promise<Response>;
  log(params?: Params): Promise<Response>;
  stats(params?: Params): Promise<Response>;
}

export class Account {
  balance(): Promise<Response>;
  senders(): Promise<Response>;
  confirmSender(email: string, code: string): Promise<Response>;
  domains(params?: Params): Promise<Response>;
  addDomain(domain: string, params?: Params): Promise<Response>;
  checkDomains(params?: Params): Promise<Response>;
  deleteDomain(domain: string, params?: Params): Promise<null>;
  webhooks(params?: Params): Promise<Response>;
  addWebhook(event: string, url: string, params?: Params): Promise<Response>;
  deleteWebhook(eventName: string): Promise<null>;
  transactionalWebhooks(params?: Params): Promise<Response>;
  addTransactionalWebhook(event: string, url: string, params?: Params): Promise<Response>;
  deleteTransactionalWebhook(eventName: string): Promise<null>;
}

export class Dialogs {
  all(params?: Params): Promise<Response>;
  get(dialogId: number | string): Promise<Response>;
  messages(dialogId: number | string, params?: Params): Promise<Response>;
  reply(dialogId: number | string, bodyText: string, params?: Params): Promise<Response>;
  markRead(dialogId: number | string, params?: Params): Promise<Response>;
  markUnread(dialogId: number | string): Promise<Response>;
  close(dialogId: number | string): Promise<Response>;
  open(dialogId: number | string): Promise<Response>;
  unreadCount(): Promise<Response>;
  attachment(attachmentId: number | string): Promise<Response>;
}

export class Router {
  domains(): Promise<Response>;
  createDomain(domain: string): Promise<Response>;
  verifyDomain(domainId: number | string): Promise<Response>;
  deleteDomain(domainId: number | string): Promise<null>;
  mxInstructions(): Promise<Response>;
  routes(): Promise<Response>;
  getRoute(routeId: number | string): Promise<Response>;
  createRoute(actions: Params[], params?: Params): Promise<Response>;
  updateRoute(routeId: number | string, params?: Params): Promise<Response>;
  deleteRoute(routeId: number | string): Promise<null>;
  rekeyRoute(routeId: number | string): Promise<Response>;
  reorderRoutes(order: Array<number | string>): Promise<Response>;
  messages(params?: Params): Promise<Response>;
  getMessage(messageId: number | string): Promise<Response>;
  deleteMessage(messageId: number | string): Promise<null>;
  getMessageAttachment(messageId: number | string, attachmentId: number | string): Promise<Response>;
  deliveries(params?: Params): Promise<Response>;
  getDelivery(deliveryId: number | string): Promise<Response>;
  settings(): Promise<Response>;
  updateSettings(params: Params): Promise<Response>;
}

export class Images {
  optimize(binaryData: Buffer, params?: Params): Promise<Response>;
  optimizeFile(filePath: string, params?: Params): Promise<Response>;
  optimizeFileBinary(filePath: string, params?: Params): Promise<BinaryResponse>;
  optimizeBinary(binaryData: Buffer, params?: Params): Promise<BinaryResponse>;
}

export default class DashaMail {
  client: Client;
  lists: Lists;
  segments: Segments;
  campaigns: Campaigns;
  automations: Automations;
  workflows: Workflows;
  templates: Templates;
  reports: Reports;
  transactional: Transactional;
  account: Account;
  dialogs: Dialogs;
  router: Router;
  images: Images;
  constructor(apiKey: string, options?: ClientOptions);
}
