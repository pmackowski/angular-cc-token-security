'use strict';

angular.module('ccTokenSecurity').controller('LoginController', ['$http', '$scope', '$rootScope', '$location', '$state', '$stateParams', 'Session', 'ccTokenSecurity',
    function ($http, $scope, $rootScope, $location, $state, $stateParams, Session, ccTokenSecurity) {

        var login = ccTokenSecurity.getLogin();

        function redirectToOriginalPath() {
            if (login.originalPath && $rootScope.originalPath) {
                $location.path($rootScope.originalPath);
                delete $rootScope.originalPath;
            } else {
                $state.go(login.nextState);
            }
        }

        $scope.login = function (username, password) {
            var authenticateUrl = ccTokenSecurity.getLogin().authenticateUrl;
            var authenticateUrlWithCredentials = authenticateUrl + '?username=' + username + '&password=' + password;
            
            $http.post(authenticateUrlWithCredentials).
                success(function(user, status, headers, config) {
                    $scope.$parent.currentUser = user; // TODO populating parentScope is not a good idea
                    Session.create(user);
                    redirectToOriginalPath();
                }).
                error(function(data, status, headers, config) {
                    $scope.authenticationError = true;
                    $scope.tokenExpired = false;
                    Session.invalidate();
                });
        };

        $scope.tokenExpired = Session.user() !== null;

    }]);