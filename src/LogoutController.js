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
        
    }]);