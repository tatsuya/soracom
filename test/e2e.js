'use strict';

var assert = require('assert');
var Soracom = require('../lib/soracom');

var EMAIL = 'PUT_YOUR_EMAIL_HERE';
var PASSWORD = 'PUT_YOUR_PASSWORD_HERE';
var IMSI = "PUT_YOUR_IMSI_HERE";

describe.skip('e2e', function() {
  var account = {
    email: EMAIL,
    password: PASSWORD
  };

  var checkResponseSuccess = function(done) {
    return function(err, res, body) {
      assert.equal(err, null);
      assert.equal(res.statusCode, 200);
      console.log(body);
      done();
    };
  };

  var checkResponseError = function(done) {
    return function(err, res, body) {
      assert.equal(typeof err, 'object');
      console.log(err);
      console.log(body);
      done();
    };
  };

  describe('auth', function() {
    it('should authenticate operator', function(done) {
      var soracom = new Soracom(account);
      soracom.post('/auth', checkResponseSuccess(done));
    });
  });

  describe('operator', function() {
    it('should get operator', function(done) {
      var soracom = new Soracom(account);
      soracom.post('/auth', function(err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        soracom.defaults(body);
        soracom.get('/operators/:operatorId', checkResponseSuccess(done));
      });
    });

    it('should fail if required param is missing', function(done) {
      var soracom = new Soracom();
      soracom.get('/operators/:operatorId', checkResponseError(done));
    });

    it('should fail if operator is not authorized', function(done) {
      var soracom = new Soracom(account);
      soracom.post('/auth', function(err, res, body) {
        soracom.get('/operators/:operatorId', { operatorId: body.operatorId }, checkResponseError(done));
      });
    });
  });

  describe('subscriber', function() {
    var soracom;

    beforeEach(function() {
      soracom = new Soracom(account);
    });

    function auth(callback) {
      soracom.post('/auth', function(err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        soracom.defaults(body);
        callback();
      });
    }

    it('should list subscribers', function(done) {
      auth(function() {
        soracom.get('/subscribers', checkResponseSuccess(done));
      });
    });

    it('should list subscribers with params', function(done) {
      auth(function() {
        soracom.get('/subscribers', { speed_class_filter: 's1.minimum' }, checkResponseSuccess(done));
      });
    });

    it('should get subscriber', function(done) {
      auth(function() {
        soracom.get('/subscribers/:imsi', { imsi: IMSI }, checkResponseSuccess(done));
      });
    });

    it('should activate subscriber', function(done) {
      auth(function() {
        soracom.post('/subscribers/:imsi/activate', { imsi: IMSI }, checkResponseSuccess(done));
      });
    });

    it('should deactivate subscriber', function(done) {
      auth(function() {
        soracom.post('/subscribers/:imsi/deactivate', { imsi: IMSI }, checkResponseSuccess(done));
      });
    });

    it('should update subscriber\'s speed classs', function(done) {
      auth(function() {
        var params = {
          imsi: IMSI,
          speedClass: 's1.minimum'
        };
        soracom.post('/subscribers/:imsi/update_speed_class', params, checkResponseSuccess(done));
      });
    });
  });
});
