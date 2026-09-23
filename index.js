'use strict';

const DashaMail = require('./src/dashamail');
const Client = require('./src/client');
const Response = require('./src/response');
const BinaryResponse = require('./src/binaryResponse');
const exceptions = require('./src/exceptions');

module.exports = DashaMail;
module.exports.DashaMail = DashaMail;
module.exports.Client = Client;
module.exports.Response = Response;
module.exports.BinaryResponse = BinaryResponse;
Object.assign(module.exports, exceptions);
