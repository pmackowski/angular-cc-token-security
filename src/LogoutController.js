'use strict';

angular.module('ccTokenSecurity').controller('LogoutController', ['$state', 'Session', 'ccTokenSecurity',
    function ($state, Session, ccTokenSecurity) {
        Session.invalidate();
        $state.go(ccTokenSecurity.getLogout().nextState);
    }]);