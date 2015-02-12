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