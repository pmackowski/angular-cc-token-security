angular-cc-token-security
=========================
Angular token security module. It depends on two projects:  
**(1)** **[AngularUI Router](https://github.com/angular-ui/ui-router)** for routing management<br/>
**(2)** **[angular-local-storage](https://github.com/grevory/angular-local-storage)** for storing current user and token

Module enables protection of ui-router states: 
```js
   $stateProvider
        .state('dashboard', {
            url: '/dashboard',
            templateUrl: 'dashboard/dashboard.html',
            access: 'ROLE_USER'
        });
            
```
It can be applied in HTML as well (after adding to scope, will be explained later on):
```html
<div ng-show="hasRole('ROLE_USER')">
  only visible to user with ROLE_USER role
</div>
<div ng-show="isAuthenticated">
  only visible to authenticated users
</div>
```

##Get Started
**(1)** Install angular-cc-token-security<br/>
**Bower:**
```bash
$ bower install angular-cc-token-security --save
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
Creates a new ui-router state `state` and registers LoginController. LoginController:
 - adds method login(username, password) to $scope, which sends POST request to `authenticateUrl`
 - is attached to `templateUrl`
 - contains optional callbacks `onInit`, `onLoginSuccess` and `onLoginError`

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
| templateUrl     | the same as in ui-router                    | 'views/login.html' |
| nextState       | next state after successful login           | 'main' |
| originalPath    | redirects to destination Url after successful login | true |
| authenticateUrl | string containing the URL to which the POST request is sent, {{ username }} and {{ password }} are replaced with username and password respectively  | |
| onInit          | invoked in LoginController body  | empty function|
| onLoginSuccess  | invoked after successful login (enables extending LoginController $scope or invoking additional actions) | empty function |
| onLoginError    | invoked after unsuccessful login (enables extending LoginController $scope or invoking additional actions) | empty function |
 
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

| Attribute       | Description                                  | Default       |
| --------------- | -------------------------------------------- | ------------- |
| state           | name for which new logout state is registered | 'logout'     |
| url             | the same as in ui-router                     |  '/logout'    |
| nextState       | next state after logout                      | 'login'       |
| logoutUrl       | HTTP GET is sent to logoutUrl to evict token | not defined   |

Under the hood, the definition of LogoutController is very simple. It only invokes Auth.logout()
and optionally sent HTTP GET to logoutUrl.
If such a definition is not enough, then attach your own controller:

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
Creates a new ui-router state `state`. Authenticated user is redirected to `state`, when trying to access protected resource with
insufficient privileges. It applies both to state change and to HTTP request, which returns 403 status code.
```js
myApp.config(function (ccTokenSecurityProvider) {
  ccTokenSecurityProvider.accessForbidden({
     state: 'accessForbidden',
     url: '/accessForbidden'
  });
});
```
where

| Attribute       | Description                                  | Default       |
| --------------- | -------------------------------------------- | ------------- |
| state           | name for which new logout accessForbidden is registered | 'accessForbidden'     |
| url             | the same as in ui-router                     |  '/accessForbidden'    |

###setUserKey
**Default:** `user`
```js
myApp.config(function (ccTokenSecurityProvider) {
  ccTokenSecurityProvider.setUserKey('yourUserKey');
});
```
###setTokenKey
**Default:** `x-auth-token`
```js
myApp.config(function (ccTokenSecurityProvider) {
  ccTokenSecurityProvider.setTokenKey('yourTokenKey');
});  
```

###Configuration Example
Using all together
```js
myApp.config(function (ccTokenSecurityProvider, localStorageServiceProvider) {
  ccTokenSecurityProvider.login({
       templateUrl: 'views/common/login.html',
       nextState: 'dashboard',
       originalPath: false, // always go to dashboard
  });
  ccTokenSecurityProvider.logout({});
  ccTokenSecurityProvider.accessForbidden({});
  
  // local storage 
  localStorageServiceProvider.setPrefix('myApp')
                             .setStorageType('sessionStorage');
  ccTokenSecurityProvider.setUserKey('currentUser');
  ccTokenSecurityProvider.setTokenKey('xAuthToken');
  
}); 
```

##Module API - Auth service
Auth service should be used mainly to get access to currentUser and hasRole/isAuthenticated functions in HTML:
```js
myApp.controller('AppController', ['$scope', 'Auth', function ($scope, Auth) {

    $scope.currentUser = Auth.currentUser();
    $scope.hasRole = Auth.hasRole;
    $scope.isAuthenticated = Auth.isAuthenticated(); 
    
}]);
```
In that case, you can show information about current user conditionally: 
```html
<div ng-show="isAuthenticated">
  You are logged in as {{ currentUser.username }}
</div>
```
##Backend
When HTTP POST request is sent to server, JSON is expected in the following format:
```js
{
    // mandatory attributes
    "token": "1mf3h3q15756h9sg9qldaafdudarkbi0ehu8"
    "roles": ["ROLE_1","ROLE_2"]
    // optional attributes e.g.
    username: "user1"
    email: "user1@email.com"
    ...
}
 ```
   
