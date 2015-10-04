'use strict';

var assert = require('assert');
var Soracom = require('../lib/soracom');

describe('soracom', function() {
  describe('#_buildPathAndParams', function() {
    it('should replace tags in path and remove prop from given params', function() {
      var soracom = new Soracom({ imsi: '123456789012345'});
      var path = '/subscribers/:imsi/tags/:tagName';
      var params = { tagName: 'foo' };
      var ret = soracom._buildPathAndParams(path, params);
      assert.equal(ret.path, '/subscribers/123456789012345/tags/foo');
      assert.deepEqual(ret.params, {});
    });

    it('should ignore array params', function() {
      var soracom = new Soracom({ imsi: '123456789012345'});
      var path = '/subscribers/:imsi/tags';
      var params = [{ tagName: 'foo', tagValue: 'bar'}];
      var ret = soracom._buildPathAndParams(path, params);
      assert.equal(ret.path, '/subscribers/123456789012345/tags');
      assert.deepEqual(ret.params, params);
    });
  });
});