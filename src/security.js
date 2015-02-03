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




