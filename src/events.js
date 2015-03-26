angular.module('ccTokenSecurity.events', [])

.constant('AUTH_EVENTS', {
    notAuthenticated: 'notAuthenticated',
    notAuthorized: 'notAuthorized',
    loginSuccessful: 'loginSuccessful',
    loginFailed: 'loginFailed',
    logout: 'logout'
});
