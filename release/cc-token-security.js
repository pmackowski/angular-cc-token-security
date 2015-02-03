'use strict';

var security = angular.module('security', [
    'security.events',
    'security.roles',
    'security.storage',
    'security.interceptor',
    'security.service',
    'ui.router'
]);

security
    .config(['$httpProvider', '$stateProvider',
        function ($httpProvider, $stateProvider) {

            $stateProvider
                .state('login', {
                    url: '/login',
                    templateUrl: 'common/security/login.html',
                    controller: 'LoginController'
                })
                .state('logout', {
                    url: '/logout',
                    controller: 'LogoutController'
                })
                .state('accessForbidden', {
                    url: '/accessForbidden',
                    templateUrl: 'common/security/403.html'
                });
        }])
    .run(['$state', '$rootScope', '$location', 'AUTH_EVENTS', 'Session', 'Auth',
        function ($state, $rootScope, $location, AUTH_EVENTS, Session, Auth) {
            delete $rootScope.originalPath;

            $rootScope.$on('$stateChangeStart', function (event, toState) {
                var access = toState.access;
                if (Auth.permitAll(access)) {
                    return;
                }
                if (Auth.isNotAuthenticated()) {
                    event.preventDefault();
                    $rootScope.originalPath = $location.path();
                    $state.go('login');
                } else if (!Auth.hasRole(access)) {
                    event.preventDefault();
                    $state.go('accessForbidden');
                }
            });

            $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
                $state.go('login');
            });

            $rootScope.$on(AUTH_EVENTS.notAuthorized, function () {
                $state.go('accessForbidden');
            });
        }]);





angular.module('security.events', [])

.constant('AUTH_EVENTS', {
    notAuthenticated: 'notAuthenticated',
    notAuthorized: 'notAuthorized'
});

angular.module('security.roles', [])
    .constant('ROLE', {
        admin: 'ROLE_ADMIN',
        user: 'ROLE_USER'
    });
'use strict';

angular.module('security.service', ['security.storage'])

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

angular.module('security.interceptor', ['security.events', 'security.storage'])

.factory('securityInterceptor', ['$rootScope', '$q', 'Session', 'AUTH_EVENTS','TOKEN_KEY',
    function ($rootScope, $q, Session, AUTH_EVENTS, TOKEN_KEY) {

        var securityInterceptor = {
            request: function (config) {
                var authToken = Session.authToken();
                if (authToken) {
                    config.headers[TOKEN_KEY] = authToken;
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

angular.module('security.storage', ['LocalStorageModule'])

    .constant('TOKEN_KEY', 'x-auth-token')
    .constant('USER_KEY', 'user')
    .constant('STORAGE_PREFIX', 'cc-app')

    .config(['localStorageServiceProvider', 'STORAGE_PREFIX', function (localStorageServiceProvider, STORAGE_PREFIX) {
        localStorageServiceProvider.setPrefix(STORAGE_PREFIX);
        localStorageServiceProvider.setStorageType('sessionStorage');
    }])

    .factory('Session', ['localStorageService','TOKEN_KEY', 'USER_KEY',
        function (localStorageService, TOKEN_KEY, USER_KEY) {
            var tokenKey = TOKEN_KEY;
            var userKey = USER_KEY;
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

angular.module('security').controller('LoginController', ['$http', '$scope', '$rootScope', '$location', '$state', '$stateParams', 'AuthResource','Session',
    function ($http, $scope, $rootScope, $location, $state, $stateParams, AuthResource, Session) {

        function redirectToOriginalPath() {
            if ($rootScope.originalPath) {
                $location.path($rootScope.originalPath);
                delete $rootScope.originalPath;
            } else {
                $state.go('global.dashboard');
            }
        }

        $scope.login = function (username, password) {
            var urlParameters = $.param({username: username, password: password});
            AuthResource.authenticate(urlParameters).$promise
                .then(function (user) {
                    $scope.$parent.currentUser = user;
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

angular.module('security').controller('LogoutController', ['$state', 'Session',
    function ($state, Session) {
        Session.invalidate();
        $state.go('login');
    }]);