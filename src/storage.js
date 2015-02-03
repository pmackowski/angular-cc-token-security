'use strict';

angular.module('security.storage', ['LocalStorageModule'])

    .constant('TOKEN_KEY', 'x-auth-token')
    .constant('USER_KEY', 'user')
    .constant('STORAGE_PREFIX', 'cc-app')

    .config(['localStorageServiceProvider', 'STORAGE_PREFIX', function (localStorageServiceProvider, STORAGE_PREFIX) {
        localStorageServiceProvider.setPrefix(STORAGE_PREFIX);
        localStorageServiceProvider.setStorageType('sessionStorage');
    }])

    .factory('Session', ['localStorageService','TOKEN_KEY', 'USER_KEY',
        function (localStorageService, TOKEN_KEY, USER_KEY) {
            var tokenKey = TOKEN_KEY;
            var userKey = USER_KEY;
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