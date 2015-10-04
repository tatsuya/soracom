'use strict';

var util = require('util');
var request = require('request');
var helper = require('./helper');

var SORACOM_API_ENDPOINT = 'https://api.soracom.io/v1';
var HTTP_METHOD = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete'
};

var Soracom = function(obj) {
  // Default headers to be merged to HTTP request headers.
  this.defaultHeaders = {};
  // Deafult params to be merged to HTTP request params.
  this.defaultParams = {};

  // Create default HTTP headers and params based on given object.
  if (typeof obj === 'object' && Object.keys(obj).length) {
    this.defaults(obj);
  }
};

/**
 * Set given object properties to either default http headers or default request
 * parameters/body. If the key of property is either `apiKey` or `token`, then
 * its value is set to default headers and deleted from original object. Otherwise
 * properties are set to default parameters/body.
 *
 * @param  {Object} obj - default http headers or default request parameters/body
 * @public
 */
Soracom.prototype.defaults = function(obj) {
  if (typeof obj !== 'object') {
    throw new TypeError('obj must be object, got ' + typeof obj);
  }
  if (obj.apiKey) {
    this.defaultHeaders['X-Soracom-API-Key'] = obj.apiKey;
    delete obj.apiKey;
  }
  if (obj.token) {
    this.defaultHeaders['X-Soracom-Token'] = obj.token;
    delete obj.token;
  }

  this.defaultParams = helper.extend(this.defaultParams, obj);
};

/**
 * Method: GET
 * @public
 */
Soracom.prototype.get = function(path, params, callback) {
  return this._request(HTTP_METHOD.GET, path, params, callback);
};

/**
 * Method: POST
 * @public
 */
Soracom.prototype.post = function(path, params, callback) {
  return this._request(HTTP_METHOD.POST, path, params, callback);
};

/**
 * Method: PUT
 * @public
 */
Soracom.prototype.put = function(path, params, callback) {
  return this._request(HTTP_METHOD.PUT, path, params, callback);
};

/**
 * Method: DELETE
 * @public
 */
Soracom.prototype.delete = function(path, params, callback) {
  return this._request(HTTP_METHOD.DELETE, path, params, callback);
};

Soracom.prototype._request = function(method, path, params, callback) {
  // If no `params` is specified but a callback is, use default params.
  if (typeof params === 'function') {
    callback = params
    params = {};
  }

  try {
    var ret = this._buildPathAndParams(path, params);
    path = ret.path;
    params = ret.params;
  } catch (err) {
    return callback(err);
  }

  var options = {
    url: SORACOM_API_ENDPOINT + path,
    method: method
  };

  if (Object.keys(this.defaultHeaders).length) {
    options.headers = this.defaultHeaders;
  }

  if (Object.keys(params).length) {
    if (method === HTTP_METHOD.POST || method === HTTP_METHOD.PUT) {
      options.body = params;
      options.json = true;
    } else {
      options.qs = params;
    }
  }

  return request(options, wrapCallback(callback));
};

Soracom.prototype._buildPathAndParams = function(path, params) {
  if (Array.isArray(params)) {
    // If the given params is an array, then we only use defaultParams as
    // candidate to replace tags in the path.
    path = helper.replacePath(path, this.defaultParams);
  } else {
    // If the given params is an object, then we first merge it with
    // defaultParams and all props in the merged params can be used to replace
    // tags in the path.
    params = helper.extend(this.defaultParams, params);
    path = helper.replacePath(path, params); // This line can throw error.
  }
  return {
    path: path,
    params: params
  };
};

/**
 * Wraps the given callback to handle HTTP response
 *
 * @param  {Function} callback
 * @return {Function} Wrapped callback function
 * @private
 */
function wrapCallback(callback) {
  return function parseResponse(err, res, body) {
    if (err) {
      return callback(err);
    }
    // Only application/json response should be decoded back to JSON
    try {
      body = JSON.parse(body);
    } catch (err) {}

    if (body.code) {
      // Handle error response
      err = new Error(body.message);
    }

    callback(err, res, body);
  };
}

/**
 * Expose constructor.
 */
module.exports = Soracom;
