angular-cc-token-security
=========================
Angular token security module

##Get Started
**(1)** Install angular-cc-token-security<br/>
**Bower:**
```bash
$ bower install pmackowski/angular-cc-token-security --save
```
**(2)** Include `angular-cc-token-security.js` (or `angular-cc-token-security.min.js`) in your `index.html`, after including Angular itself.

**(3)** Add `'ccTokenSecurity'` to your main module's list of dependencies.
When you're done, your setup should look similar to the following:

```html
<!doctype html>
<html ng-app="myApp">
<head>

</head>
<body>
    ...
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.3.0/angular.min.js"></script>
    <script src="bower_components/angular-cc-token-security/release/angular-cc-token-security.js"></script>
    ...
    <script>
        var myApp = angular.module('myApp', ['ccTokenSecurity']);

    </script>
    ...
</body>
</html>
```

##Configuration
###login
**Default:** `...`
```js
myApp.config(function (ccTokenSecurityProvider) {
  ccTokenSecurityProvider.login({
     state: 'login',
     url: '/login',
     templateUrl: 'views/login.html',
     nextState: 'main',
     originalPath: true
  });
```
###logout
**Default:** `...`
```js
  ccTokenSecurityProvider.logout({
     templateUrl: 'views/login.html',
     nextState: 'stateAfterLogout'
  });
```
###accessForbidden
**Default:** `...`
```js
  ccTokenSecurityProvider.accessForbidden({
     state: 'accessForbidden',
     url: '/accessForbidden'
  });
```
###setUserKey
**Default:** `user`
```js
  ccTokenSecurityProvider.setUserKey('yourUserKey');
```
###setTokenKey
**Default:** `x-auth-token`
```js
  ccTokenSecurityProvider.setTokenKey('yourTokenKey');
```