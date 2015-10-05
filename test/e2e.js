'use strict';

var assert = require('assert');
var Soracom = require('../lib/soracom');

var account = require('./account');

describe('e2e', function() {
  var checkResponseSuccess = function(done) {
    return function(err, res, body) {
      assert.equal(err, null);
      assert(200 <= res.statusCode && res.statusCode < 300);
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
    var imsi;

    before(function(done) {
      soracom = new Soracom(account);

      soracom.post('/auth', function(err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        soracom.defaults(body);

        soracom.get('/subscribers', function(err, res, body) {
          assert.equal(err, null);
          assert.equal(res.statusCode, 200);
          if (!body.length) {
            throw new Error('Subscriber not found.');
          }
          imsi = body[0].imsi;
          done();
        });
      });
    });

    it('should list subscribers', function(done) {
      soracom.get('/subscribers', checkResponseSuccess(done));
    });

    it('should list subscribers with params', function(done) {
      soracom.get('/subscribers', { speed_class_filter: 's1.minimum' }, checkResponseSuccess(done));
    });

    it('should get subscriber', function(done) {
      soracom.get('/subscribers/:imsi', { imsi: imsi }, checkResponseSuccess(done));
    });

    it('should activate subscriber', function(done) {
      soracom.post('/subscribers/:imsi/activate', { imsi: imsi }, checkResponseSuccess(done));
    });

    it('should deactivate subscriber', function(done) {
      soracom.post('/subscribers/:imsi/deactivate', { imsi: imsi }, checkResponseSuccess(done));
    });

    it('should update subscriber\'s speed classs', function(done) {
      var params = {
        imsi: imsi,
        speedClass: 's1.minimum'
      };
      soracom.post('/subscribers/:imsi/update_speed_class', params, checkResponseSuccess(done));
    });

    it('should update subscriber\'s tags', function(done) {
      var params = [
        {
          tagName: 'tag_name_1',
          tagValue: 'tag_value_1'
        }
      ];
      soracom.put('/subscribers/' + imsi + '/tags', params, checkResponseSuccess(done));
    });

    it('should delete subscriber\'s tags', function(done) {
      var params = {
        imsi: imsi,
        tagName: 'tag_name_1'
      };
      soracom.delete('/subscribers/:imsi/tags/:tagName', params, checkResponseSuccess(done));
    });
  });

  describe('stats', function() {
    var soracom;
    var imsi;

    before(function(done) {
      soracom = new Soracom(account);

      soracom.post('/auth', function(err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        soracom.defaults(body);

        soracom.get('/subscribers', function(err, res, body) {
          assert.equal(err, null);
          assert.equal(res.statusCode, 200);
          if (!body.length) {
            throw new Error('Subscriber not found.');
          }
          imsi = body[0].imsi;
          done();
        });
      });
    });

    it('should get air usage report of subscriber', function(done) {
      var params = {
        imsi: imsi,
        from: 1443657600,
        to: 1446335999,
        period: 'day'
      };
      soracom.get('/stats/air/subscribers/:imsi', params, checkResponseSuccess(done));
    });
  });

  describe('groups', function() {
    // TODO: Fix error: Unrecognized field "password" (class models.Group), not marked as ignorable (8 known properties:...
    // it('should create group', function(done) {
    //   var soracom = new Soracom(account);
    //   soracom.post('/auth', function(err, res, body) {
    //     assert.equal(err, null);
    //     assert.equal(res.statusCode, 200);
    //     soracom.defaults(body);
    //     var params = {
    //       tags: {
    //         location: "tokyo"
    //       }
    //     };
    //     soracom.post('/groups', params, checkResponseSuccess(done));
    //   });
    // });

    it('should list groups', function(done) {
      var soracom = new Soracom(account);
      soracom.post('/auth', function(err, res, body) {
        assert.equal(err, null);
        assert.equal(res.statusCode, 200);
        soracom.defaults(body);
        soracom.get('/groups', checkResponseSuccess(done));
      });
    });
  });
});
