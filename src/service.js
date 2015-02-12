angular.module('ccTokenSecurity.service', ['ccTokenSecurity.storage','ccTokenSecurity.provider', 'ngResource', 'ui.router'])

.factory('Auth', ['Session', 'ccTokenSecurity', '$state', '$rootScope', '$location',  function (Session, ccTokenSecurity, $state, $rootScope, $location) {

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

    auth.login = function(user) {
        Session.create(user);
        var login = ccTokenSecurity.getLogin();
        if (login.originalPath && $rootScope.originalPath) {
            $location.path($rootScope.originalPath);
            delete $rootScope.originalPath;
        } else {
            $state.go(login.nextState);
        }
    };
        
    auth.logout = function() {
        var logout = ccTokenSecurity.getLogout();
        Session.invalidate();
        $state.go(logout.nextState);
    };

    auth.invalidateSession = function() {
        Session.invalidate();
    };

    return auth;
}]);