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
Creates a new ui-router state `state` and registers LoginController. LoginController
**(1)** adds method login(username, password) to $scope, which sends POST to `authenticateUrl`
**(2)** contains optional callbacks `onInit`, `onLoginSuccess` and `onLoginError`.
**(3)** is attached to `templateUrl`

```js
myApp.config(function (ccTokenSecurityProvider) {
  ccTokenSecurityProvider.login({
     state: 'login',
     url: '/login',
     templateUrl: 'views/login.html',
     nextState: 'main',
     originalPath: true,
     authenticateUrl: 'authenticate?username={{ username }}&password={{ password }}',
     onInit: function($scope, Auth) {},
     onLoginSuccess: function($scope, user) {},
     onLoginError: function($scope) {}
  });
});  
```
where

| Attribute       | Description                                  | Default       |
| --------------- | -------------------------------------------- | ------------- |
| state           | name for which new login state is registered | 'login'       |
| url             | the same as in ui-router                     |  '/login'             |
| templateUrl     |  the same as in ui-router                    | 'views/login.html' |
| nextState       |  next state after successful login           | 'main' |
| originalPath    |  redirects to destination Url after successful login | true |
| authenticateUrl | string containing the URL to which the POST request is sent, {{ username }} and {{ password }} are replaced with username and password respectively  | |
| onInit          | invoked in LoginController body  | empty function|
| onLoginSuccess  |  invoked after successful login (enables extending LoginController $scope or invoke additional actions) | empty function |
| onLoginError    | invoked after unsuccessful login (enables extending LoginController $scope or invoke additional actions) | empty function |
 
###logout
Creates a new ui-router state `state` and registers LogoutController.
```js
myApp.config(function (ccTokenSecurityProvider) {
  ccTokenSecurityProvider.logout({
     state: 'logout',
     url: '/logout',
     nextState: 'stateAfterLogout'
  });
}); 
```
where
 state - name for which new logout state is registered (default: 'logout')
 url - the same as in ui-router (default: '/logout')
 nextState - next state after logout (default: 'login')

Under the hood, the definition of LogoutController is very simple, it only invokes Auth.logout().
If such a definition is not enough, then attach your own controller

```js
myApp.config(function (ccTokenSecurityProvider) {
  ccTokenSecurityProvider.logout({
     nextState: 'stateAfterLogout',
     controller: function (Auth) {
        Auth.logout();
        // additional code here
     }
  });
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