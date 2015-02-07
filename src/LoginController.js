'use strict';

angular.module('ccTokenSecurity').controller('LoginController', ['$http', '$scope', '$rootScope', '$location', '$state', '$stateParams', 'AuthResource','Session', 'ccTokenSecurity',
    function ($http, $scope, $rootScope, $location, $state, $stateParams, AuthResource, Session, ccTokenSecurity) {

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
            AuthResource.authenticate('username=' + username + '&password=' + password).$promise // TODO
                .then(function (user) {
                    $scope.$parent.currentUser = user; // TODO populating parentScope is not a good idea
                    Session.create(user);
                    redirectToOriginalPath();
                }).catch(function (response) {
                    $scope.authenticationError = true;
                    $scope.tokenExpired = false;
                    Session.invalidate();
                });

        };

        $scope.tokenExpired = Session.user() !== null;

    }])

    .factory('AuthResource', ['$resource',
        function ($resource) {
            return $resource(':action', {}, {
                authenticate: {
                    method: 'POST',
                    params: {'action': 'authenticate'},
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }
            });
        }]);