'use strict';

angular.module('security.service', ['security.storage'])

.factory('Auth', ['Session', function (Session) {

    var auth = {};

    auth.permitAll = function (role) {
        return !angular.isDefined(role);
    };

    auth.isAuthenticated = function () {
        return Session.user() !== null;
    };

    auth.isNotAuthenticated = function () {
        return !auth.isAuthenticated();
    };

    auth.hasRole = function (role) {
        var user = Session.user();
        if (user === null) {
            return false;
        }
        var hasRole = false;
        angular.forEach(user.roles, function (userRole) {
            if (role === userRole) {
                hasRole = true;
            }
        });
        return hasRole;
    };

    auth.currentUser = function () {
        return Session.user();
    };

    return auth;
}]);
