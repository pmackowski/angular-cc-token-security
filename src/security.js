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
            if (Auth.permitAll(access)) {
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




