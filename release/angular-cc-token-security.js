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

security.run(['$state', '$rootScope', '$location', 'AUTH_EVENTS', 'Session', 'Auth', 'ccTokenSecurity',
    function ($state, $rootScope, $location, AUTH_EVENTS, Session, Auth, ccTokenSecurity) {

        var login = ccTokenSecurity.getLogin();
        var accessForbidden = ccTokenSecurity.getAccessForbidden();

        delete $rootScope.originalPath;

        $rootScope.$on('$stateChangeStart', function (event, toState) {
            var access = toState.access;
            if (Auth.permitAll(access)) {
                return;
            }
            if (Auth.isNotAuthenticated()) {
                event.preventDefault();
                $rootScope.originalPath = $location.path(); // TODO
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

'use strict';

angular.module('ccTokenSecurity.service', ['ccTokenSecurity.storage'])

.factory('Auth', ['Session', function (Session) {

    var auth = {};

    auth.permitAll = function (role) {
        return !angular.isDefined(role);
    };

    auth.isAuthenticated = function () {
        return Session.user() !== null;
    };

    auth.isNotAuthenticated = function () {
        return !auth.isAuthenticated();
    };

    auth.hasRole = function (role) {
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

    return auth;
}]);

'use strict';

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
'use strict';

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
'use strict';

angular.module('ccTokenSecurity.provider', ['ui.router'])
    .provider('ccTokenSecurity', function($stateProvider) {

        var tokenKey = 'x-auth-token';
        var userKey = 'user';

        var loginState = {
            state: 'login',
            url: '/login',
            templateUrl: 'views/login.html',
            nextState: 'main',
            originalPath: true
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
'use strict';

angular.module('ccTokenSecurity').controller('LoginController', ['$http', '$scope', '$rootScope', '$location', '$state', '$stateParams', 'AuthResource','Session', 'ccTokenSecurity',
    function ($http, $scope, $rootScope, $location, $state, $stateParams, AuthResource, Session, ccTokenSecurity) {

        var login = ccTokenSecurity.getLogin();

        function redirectToOriginalPath() {
            if (login.originalPath && $rootScope.originalPath) {
                $location.path($rootScope.originalPath);
                delete $rootScope.originalPath;
            } else {
                $state.go(login.nextState);
            }
        }

        $scope.login = function (username, password) {
            AuthResource.authenticate('username=' + username + '&password=' + password).$promise // TODO
                .then(function (user) {
                    $scope.$parent.currentUser = user; // TODO populating parentScope is not a good idea
                    Session.create(user);
                    redirectToOriginalPath();
                }).catch(function (response) {
                    $scope.authenticationError = true;
                    $scope.tokenExpired = false;
                    Session.invalidate();
                });

        };

        $scope.tokenExpired = Session.user() !== null;

    }])

    .factory('AuthResource', ['$resource',
        function ($resource) {
            return $resource(':action', {}, {
                authenticate: {
                    method: 'POST',
                    params: {'action': 'authenticate'},
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }
            });
        }]);
'use strict';

angular.module('ccTokenSecurity').controller('LogoutController', ['$state', 'Session', 'ccTokenSecurity',
    function ($state, Session, ccTokenSecurity) {
        var logout = ccTokenSecurity.getLogout();
        Session.invalidate();
        $state.go(logout.nextState);
    }]);