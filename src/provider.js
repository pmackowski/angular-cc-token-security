angular.module('ccTokenSecurity.provider', ['ui.router'])
    .provider('ccTokenSecurity', function($stateProvider) {

        var tokenKey = 'x-auth-token';
        var userKey = 'user';
        var authenticationRequired = false;

        var loginState = {
            state: 'login',
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'LoginController',
            nextState: 'main',
            originalPath: true,
            
            authenticateUrl: 'authenticate?username={{ username }}&password={{ password }}'
        };

        var logoutState = {
            state: 'logout',
            url: '/logout',
            controller: 'LogoutController',
            nextState: 'login'
        };

        var accessForbidden = {
            state: 'accessForbidden',
            url: '/accessForbidden'
        };

        this.setTokenKey = function(key) {
            tokenKey = key;
        };

        this.setUserKey = function(key) {
            userKey = key;
        };

        this.requiresAuthentication = function() {
            authenticationRequired = true;
        };
        
        this.login = function(obj) {
            _state(loginState, obj);
        };

        this.logout = function(obj) {
            _state(logoutState, obj);
        };

        this.accessForbidden = function(obj) {
            _state(accessForbidden, obj);
        };

        function _state(dest, src) {
            angular.extend(dest, src);
            $stateProvider.state(dest.state, dest);
        }

        this.$get = function() {
            return {
                getTokenKey: function() {
                    return tokenKey;
                },
                getUserKey: function() {
                    return userKey;
                },
                isAuthenticationRequired: function() {
                    return authenticationRequired;
                },
                getLogin: function() {
                    return loginState;
                },
                getLogout: function() {
                    return logoutState;
                },
                getAccessForbidden: function() {
                    return accessForbidden;
                }
            };
        };
    });