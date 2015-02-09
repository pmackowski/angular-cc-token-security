'use strict';

angular.module('ccTokenSecurity').controller('LogoutController', ['$state', 'Session', 'ccTokenSecurity',
    function ($state, Session, ccTokenSecurity) {
        var logout = ccTokenSecurity.getLogout();
        Session.invalidate();
        $state.go(logout.nextState);
    }]);