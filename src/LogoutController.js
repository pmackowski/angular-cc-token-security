angular.module('ccTokenSecurity').controller('LogoutController', ['Auth', 'AUTH_EVENTS', '$rootScope',
    function (Auth, AUTH_EVENTS, $rootScope) {
        Auth.logout();
        $rootScope.$broadcast(AUTH_EVENTS.logout);
    }]);