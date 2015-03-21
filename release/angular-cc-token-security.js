/**
 * Angular token security module based on ui-router and local-storage
 * @version v0.1.2 - 2015-03-21
 * @link https://github.com/pmackowski/angular-cc-token-security
 * @author pmackowski <pmackowski@coffeecode.pl>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function ( window, angular, undefined ) {
'use strict';

var security = angular.module('ccTokenSecurity', [
    'ccTokenSecurity.events',
    'ccTokenSecurity.storage',
    'ccTokenSecurity.interceptor',
    'ccTokenSecurity.service',
    'ccTokenSecurity.provider',
    'ngResource',
    'ui.router'
]);

security.run(['$state', '$rootScope', '$location', 'AUTH_EVENTS', 'Auth', 'ccTokenSecurity',
    function ($state, $rootScope, $location, AUTH_EVENTS, Auth, ccTokenSecurity) {

        var login = ccTokenSecurity.getLogin();
        var accessForbidden = ccTokenSecurity.getAccessForbidden();

        delete $rootScope.originalPath;

        $rootScope.$on('$stateChangeStart', function (event, toState) {
            var access = toState.access;
            var state = toState.state;
            if (Auth.permitAll(state, access)) {
                return;
            }
            if (Auth.isNotAuthenticated()) {
                event.preventDefault();
                $rootScope.originalPath = $location.path();
                $state.go(login.state);
            } else if (!Auth.hasRole(access)) {
                event.preventDefault();
                $state.go(accessForbidden.state);
            }
        });

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
            $state.go(login.state);
        });

        $rootScope.$on(AUTH_EVENTS.notAuthorized, function () {
            $state.go(accessForbidden.state);
        });
    }]);

angular.module('ccTokenSecurity.events', [])

.constant('AUTH_EVENTS', {
    notAuthenticated: 'notAuthenticated',
    notAuthorized: 'notAuthorized'
});

angular.module('ccTokenSecurity.service', ['ccTokenSecurity.storage','ccTokenSecurity.provider', 'ngResource', 'ui.router'])

.factory('Auth', ['Session', 'ccTokenSecurity', '$state', '$rootScope', '$location',  function (Session, ccTokenSecurity, $state, $rootScope, $location) {

    var auth = {};
    
    auth.permitAll = function (state, role) {
        var login = ccTokenSecurity.getLogin();
        var logout = ccTokenSecurity.getLogout();
        var accessForbidden = ccTokenSecurity.getAccessForbidden();
        if (login.state === state || logout.state === state || accessForbidden.state === state) {
            return true;
        }
        var authenticationRequired = ccTokenSecurity.isAuthenticationRequired();
        return !authenticationRequired && !angular.isDefined(role);
    };

    auth.isAuthenticated = function () {
        return Session.user() !== null;
    };

    auth.isNotAuthenticated = function () {
        return !auth.isAuthenticated();
    };

    auth.hasRole = function (role) {
        if (!role) {
            return true;
        }
        var user = Session.user();
        if (user === null) {
            return false;
        }
        var hasRole = false;
        angular.forEach(user.roles, function (userRole) {
            if (role === userRole) {
                hasRole = true;
            }
        });
        return hasRole;
    };

    auth.currentUser = function () {
        return Session.user();
    };

    auth.login = function(user) {
        Session.create(user);
        var login = ccTokenSecurity.getLogin();
        if (login.originalPath && $rootScope.originalPath) {
            $location.path($rootScope.originalPath);
            delete $rootScope.originalPath;
        } else {
            $state.go(login.nextState);
        }
    };
        
    auth.logout = function() {
        var logout = ccTokenSecurity.getLogout();
        Session.invalidate();
        $state.go(logout.nextState);
    };

    auth.invalidateSession = function() {
        Session.invalidate();
    };

    return auth;
}]);
angular.module('ccTokenSecurity.interceptor', ['ccTokenSecurity.events', 'ccTokenSecurity.storage', 'ccTokenSecurity.provider'])

.factory('securityInterceptor', ['$rootScope', '$q', 'Session', 'AUTH_EVENTS','ccTokenSecurity',
    function ($rootScope, $q, Session, AUTH_EVENTS, ccTokenSecurity) {

        var securityInterceptor = {
            request: function (config) {
                var authToken = Session.authToken();
                var tokenKey = ccTokenSecurity.getTokenKey();
                if (authToken) {
                    config.headers[tokenKey] = authToken;
                }
                return config;
            },

            responseError: function (response) {
                var status = response.status;
                if (status == 401) {
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated, response);
                } else if (status == 403) {
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized, response);
                }
                return $q.reject(response);
            }
        };
        return securityInterceptor;
    }])

.config(['$httpProvider', function($httpProvider) {
      $httpProvider.interceptors.push('securityInterceptor');
}]);
angular.module('ccTokenSecurity.storage', ['LocalStorageModule', 'ccTokenSecurity.provider'])

    .factory('Session', ['localStorageService', 'ccTokenSecurity',
        function (localStorageService, ccTokenSecurity) {
            var tokenKey = ccTokenSecurity.getTokenKey();
            var userKey = ccTokenSecurity.getUserKey();

            return {
                create: function (user) {
                    localStorageService.set(tokenKey, user.token);
                    localStorageService.set(userKey, user);
                },
                user: function () {
                    return localStorageService.get(userKey);
                },
                authToken: function () {
                    return localStorageService.get(tokenKey);
                },
                invalidate: function () {
                    localStorageService.remove(tokenKey);
                    localStorageService.remove(userKey);
                }
            };
        }
    ]);
angular.module('ccTokenSecurity.provider', ['ui.router'])
    .provider('ccTokenSecurity', function($stateProvider) {

        var tokenKey = 'x-auth-token';
        var userKey = 'user';
        var authenticationRequired = false;

        var loginState = {
            state: 'login',
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'LoginController',
            nextState: 'main',
            originalPath: true,
            
            authenticateUrl: 'authenticate?username={{ username }}&password={{ password }}',
            onInit: function($scope, Auth) {},
            onLoginSuccess: function($scope, user) {},
            onLoginError: function($scope) {}
        };

        var logoutState = {
            state: 'logout',
            url: '/logout',
            controller: 'LogoutController',
            nextState: 'login'
        };

        var accessForbidden = {
            state: 'accessForbidden',
            url: '/accessForbidden'
        };

        this.setTokenKey = function(key) {
            tokenKey = key;
        };

        this.setUserKey = function(key) {
            userKey = key;
        };

        this.requiresAuthentication = function() {
            authenticationRequired = true;
        };
        
        this.login = function(obj) {
            _state(loginState, obj);
        };

        this.logout = function(obj) {
            _state(logoutState, obj);
        };

        this.accessForbidden = function(obj) {
            _state(accessForbidden, obj);
        };

        function _state(dest, src) {
            angular.extend(dest, src);
            $stateProvider.state(dest.state, dest);
        }

        this.$get = function() {
            return {
                getTokenKey: function() {
                    return tokenKey;
                },
                getUserKey: function() {
                    return userKey;
                },
                isAuthenticationRequired: function() {
                    return authenticationRequired;
                },
                getLogin: function() {
                    return loginState;
                },
                getLogout: function() {
                    return logoutState;
                },
                getAccessForbidden: function() {
                    return accessForbidden;
                }
            };
        };
    });
angular.module('ccTokenSecurity').controller('LoginController', ['$http', '$scope', 'Auth', 'ccTokenSecurity',
    function ($http, $scope, Auth, ccTokenSecurity) {

        var login = ccTokenSecurity.getLogin();
        login.onInit($scope, Auth);
        
        $scope.login = function (username, password) {
            var usernamePattern = /{{\s*username\s*}}/;
            var passwordPattern = /{{\s*password\s*}}/;
            
            var authenticateUrl = login.authenticateUrl
                                        .replace(usernamePattern, username)
                                        .replace(passwordPattern, password);

            $http.post(authenticateUrl).
                success(function(user, status, headers, config) {
                    Auth.login(user);
                    login.onLoginSuccess($scope, user);
                }).
                error(function(data, status, headers, config) {
                    Auth.invalidateSession();
                    login.onLoginError($scope);
                });
        };

    }]);
angular.module('ccTokenSecurity').controller('LogoutController', ['$scope', '$http', 'Auth', 'ccTokenSecurity',
    function ($scope, $http, Auth, ccTokenSecurity) {
        var logout = ccTokenSecurity.getLogout();

        if (logout.logoutUrl) {
            $http.get(logout.logoutUrl).
                success(function(user, status, headers, config) { }).
                error(function(data, status, headers, config) { }).
                finally(function() {
                    Auth.logout();
                });
        } else {
            Auth.logout();
        }
        
    }]);})( window, window.angular );