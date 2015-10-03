# soracom

SORACOM API client for Node.js.

## Install

```
$ npm install soracom
```

## Usage

Authenticate with a pair of `email` and `password`, then retrieve your operator information.

```js
var Soracom = require('soracom');
var soracom = new Soracom({ email: 'email', password: 'password' });
soracom.post('/auth', function(err, res, auth) {
  if (!error) {
  	console.log(auth); // {apiKey: "api_key", token: "token", operatorId: "operator_id"}
  	soracom.defaults(auth);
    soracom.get('/operators/:operatorId', function(err, res, operator) {});
  }
});
```

You can also specify your credentials directly on instantiation.

```js
var Soracom = require('soracom');
var soracom = new Soracom({
  apiKey: 'api_key',
  token: 'token',
  operatorId: 'operator_id'
});
soracom.get('/operators/:operatorId', function(err, res, operator) {})
```

The given `apiKey` and `token` are automatically set to HTTP header on subsequent requests. The rest of properties, in the above case `operatorId`, are used as any of default request path, query or request body.

## Examples

All examples below assume that you already set the following credentials to the `soracom` object.

```js
var Soracom = require('soracom');
soracom = new Soracom();
soracom.defaults({
  apiKey: 'api_key',
  token: 'token',
  operatorId: 'operator_id'
});
```

### Operator

Get operator.

```js
soracom.get('/operators/:operatorId', function(err, res, body) {});
```

Create operator.

```js
soracom.post('/operators', { email: 'email', password: 'password' }, function(err, res, body) {});
```

### Subscriber

List subscribers with speed class `s1.minimum`.

```js
soracom.get('/subscribers', { speed_class_filter: 's1.minimum' }, function(err, res, body) {});
```

Get subscriber.

```js
soracom.get('/subscriber/:imsi', { ismi: '123456789012345' }, function(err, res, body) {});
```

Activate subscriber.

```js
soracom.post('/subscribers/:imsi/activate', { imsi: '123456789012345' }, function(err, res, body) {});
```

Deactivate subscriber.

```js
soracom.post('/subscribers/:imsi/deactivate', { imsi: '123456789012345' }, function(err, res, body) {});
```

## API

### `var soracom = new Soracom(obj);`

Create a `Soracom` instance that can be used to make reqeusts to SORACOM's APIs.

If authenticating with user account, `obj` should look like:

```js
new Soracom({ email: 'email@example.com', password: 'superStrongP@ssw0rd' });
```

If authenticating with credentials, `obj` should look like:

```js
new Soracom({ apiKey: 'api_key', token: 'very_long_string_token' });
```

### `soracom.defaults(obj);`

Set given object properties to either default http headers or default request path, query or request body.

If the key of property is either `apiKey` or `token`, then its value is set to default headers and deleted from original object. The headers are mapped like below:

```
headers = {
  'X-Soracom-API-Key': apiKey,
  'X-Soracom-Token': token
};
```

### `soracom.get(path, [params], callback);`

GET any of the REST API endpints.

#### `path`

The endpoint to hit. When path contains special tag starts with `:`, then that tag should be treated as variable. If there is property with same name as that variable existed in the given param, then the tag is replaces with that value.

Example 1:

```js
var soracom = new Soracom({ apiKey: 'api_key', token: 'token', operatorId: 'OP1234567890' });
soracom.get('/operators/:operatorId', callback);
// The operatorId is exracted from default params, so the endpoint will be "/operators/OP1234567890"
```

Example 2:

```js
soracom.get('/subscriber/:imsi', { imsi: '123456789012345' }, callback);
// The imsi is exracted from given params in a same function call, so the endpoint will be "/subscribers/123456789012345"
```

#### `params`

(Optional) parameters for request.

#### `callback`

The callback argument gets 3 arguments `function (error, response, body)`:

- `error`: An `error` object when applicable
- `response`: An `http.IncomingMessage` object
- `body`: `JSON.parse()`ed response body

### `soracom.post(path, [params], callback);`

Same as `get()`, but set method to `POST`.

### `soracom.put(path, [params], callback);`

Same as `get()`, but set method to `PUT`.

### `soracom.delete(path, [params], callback);`

Same as `get()`, but set method to `DELETE`.

# License

MIT
