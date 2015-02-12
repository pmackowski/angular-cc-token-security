angular.module('ccTokenSecurity').controller('LoginController', ['$http', '$scope', 'Auth', 'ccTokenSecurity',
    function ($http, $scope, Auth, ccTokenSecurity) {

        var login = ccTokenSecurity.getLogin();
        login.onInit($scope, Auth);
        
        $scope.login = function (username, password) {
            var usernamePattern = /{{\s*username\s*}}/;
            var passwordPattern = /{{\s*password\s*}}/;
            
            var authenticateUrl = login.authenticateUrl
                                        .replace(usernamePattern, username)
                                        .replace(passwordPattern, password);

            $http.post(authenticateUrl).
                success(function(user, status, headers, config) {
                    Auth.login(user);
                    login.onLoginSuccess($scope, user);
                }).
                error(function(data, status, headers, config) {
                    Auth.invalidateSession();
                    login.onLoginError($scope);
                });
        };

    }]);