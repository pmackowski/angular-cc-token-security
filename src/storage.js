'use strict';

angular.module('ccTokenSecurity.storage', ['LocalStorageModule', 'ccTokenSecurity.provider'])

    .factory('Session', ['localStorageService', 'ccTokenSecurity',
        function (localStorageService, ccTokenSecurity) {
            var tokenKey = ccTokenSecurity.getTokenKey();
            var userKey = ccTokenSecurity.getUserKey();

            return {
                create: function (user) {
                    localStorageService.set(tokenKey, user.token);
                    localStorageService.set(userKey, user);
                },
                user: function () {
                    return localStorageService.get(userKey);
                },
                authToken: function () {
                    return localStorageService.get(tokenKey);
                },
                invalidate: function () {
                    localStorageService.remove(tokenKey);
                    localStorageService.remove(userKey);
                }
            };
        }
    ]);