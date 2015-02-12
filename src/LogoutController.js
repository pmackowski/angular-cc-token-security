angular.module('ccTokenSecurity').controller('LogoutController', ['Auth',
    function (Auth) {
        Auth.logout();
    }]);