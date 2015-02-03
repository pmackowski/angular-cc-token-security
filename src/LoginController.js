'use strict';

angular.module('security').controller('LoginController', ['$http', '$scope', '$rootScope', '$location', '$state', '$stateParams', 'AuthResource','Session',
    function ($http, $scope, $rootScope, $location, $state, $stateParams, AuthResource, Session) {

        function redirectToOriginalPath() {
            if ($rootScope.originalPath) {
                $location.path($rootScope.originalPath);
                delete $rootScope.originalPath;
            } else {
                $state.go('global.dashboard');
            }
        }

        $scope.login = function (username, password) {
            var urlParameters = $.param({username: username, password: password});
            AuthResource.authenticate(urlParameters).$promise
                .then(function (user) {
                    $scope.$parent.currentUser = user;
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