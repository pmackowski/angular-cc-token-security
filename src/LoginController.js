angular.module('ccTokenSecurity').controller('LoginController', ['$http', '$scope', '$rootScope', 'Auth', 'AUTH_EVENTS', 'ccTokenSecurity',
    function ($http, $scope, $rootScope, Auth, AUTH_EVENTS, ccTokenSecurity) {

        var login = ccTokenSecurity.getLogin();
        $scope.tokenExpired = Auth.currentUser() !== null;
        
        $scope.login = function (username, password) {
            var usernamePattern = /{{\s*username\s*}}/;
            var passwordPattern = /{{\s*password\s*}}/;
            
            var authenticateUrl = login.authenticateUrl
                                        .replace(usernamePattern, username)
                                        .replace(passwordPattern, password);

            $http.post(authenticateUrl).
                success(function(user, status, headers, config) {
                    Auth.login(user);
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccessful, user);
                }).
                error(function(data, status, headers, config) {
                    Auth.invalidateSession();
                    $scope.authenticationFailed = true;
                    $scope.tokenExpired = false;
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                });
        };

    }]);