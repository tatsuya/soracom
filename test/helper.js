'use strict';

var assert = require('assert');
var helper = require('../lib/helper');

describe('helper', function() {
  describe('#replacePath()', function() {
    it('should replace path template with given parameter', function() {
      var path = helper.replacePath('/operators/:operator_id', {
        operator_id: 'OP1234567890'
      });
      assert.equal(path, '/operators/OP1234567890');
    });

    it('should replace path template with multiple parameters', function() {
      var path = helper.replacePath('/operators/:a/:b', {
        a: 'a',
        b: 'b'
      });
      assert.equal(path, '/operators/a/b');
    });

    it('should throw error if required parameter is missing', function() {
      assert.throws(function() {
        var path = helper.replacePath('/operators/:operator_id', {});
      }, Error);
    });
  });
});