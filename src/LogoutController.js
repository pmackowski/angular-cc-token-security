'use strict';

angular.module('security').controller('LogoutController', ['$state', 'Session',
    function ($state, Session) {
        Session.invalidate();
        $state.go('login');
    }]);