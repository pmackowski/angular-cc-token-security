angular.module('security.events', [])

.constant('AUTH_EVENTS', {
    notAuthenticated: 'notAuthenticated',
    notAuthorized: 'notAuthorized'
});
