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