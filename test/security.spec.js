describe('module ccTokenSecurity: ', function(){

    beforeEach(function () {
        angular.module('ccTokenSecurityTest', function () {})
            .config(function ($stateProvider, ccTokenSecurityProvider) {
                $stateProvider.state('state1', {
                    url: '/state1',
                    access: 'ROLE_1'
                });
                $stateProvider.state('state2', {
                    url: '/state2',
                    access: 'ROLE_2'
                });
                $stateProvider.state('state3', {
                    url: '/state3'
                });
                ccTokenSecurityProvider.login({
                    state: 'overrideLogin',
                    templateUrl: 'test/views/login.html'
                });
                ccTokenSecurityProvider.accessForbidden({});
            });
        module('ccTokenSecurity', 'ccTokenSecurityTest');
        module('test/views/login.html');

        inject(function () {});
    });

    var user1 = {
        login: 'user1',
        email: 'user1@email.com',
        token: 'token1',
        roles: ['ROLE_1','ROLE_2']
    };

    var user2 = {
        login: 'user2',
        email: 'user2@email.com',
        token: 'token2',
        roles: ['ROLE_2']
    };

    var user3 = {
        login: 'user3',
        email: 'user3@email.com',
        token: 'token3',
        roles: []
    };


    describe('', function() {

        var scope, mockState, mockSession;

        beforeEach(inject(function(Session, $state, $rootScope) {
            scope = $rootScope.$new();
            mockState = $state;
            mockSession = Session;
        }));

        afterEach(function() {
            mockSession.invalidate();
        });

        it('should unauthenticated user be directed to (overridden) login state when trying to access protected resource', function(){
            // when
            scope.$apply(function(){
                mockState.go('state1');
            });
            // then
            expect(mockState.current.name).toBe('overrideLogin');
        });


        it('should unauthenticated user be allowed to get to unprotected resource', function(){
            // when
            scope.$apply(function(){
                mockState.go('state3');
            });
            // then
            expect(mockState.current.name).toBe('state3');
        });


        it('should user with sufficient privileges be allowed to get to protected resource', function(){
            // given
            mockSession.create(user1);
            // when
            scope.$apply(function(){
                mockState.go('state1');
            });
            // then
            expect(mockState.current.name).toBe('state1');
        });

        it('should user with insufficient privileges be not allowed to get to protected resource', function(){
            // given
            mockSession.create(user2);
            // when
            scope.$apply(function(){
                mockState.go('state1');
            });
            // then
            expect(mockState.current.name).toBe('accessForbidden');
        });

        it('should authenticated user be allowed to get to unprotected resource', function(){
            // given
            mockSession.create(user2);
            // when
            scope.$apply(function(){
                mockState.go('state3');
            });
            // then
            expect(mockState.current.name).toBe('state3');
        });

        it('should authenticated user with no roles be allowed to get to unprotected resource', function(){
            // given
            mockSession.create(user3);
            // when
            scope.$apply(function(){
                mockState.go('state3');
            });
            // then
            expect(mockState.current.name).toBe('state3');
        });

    });
});

describe('module ccTokenSecurity with all states protected: ', function(){

    beforeEach(function () {
        angular.module('ccTokenSecurityTest', function () {})
            .config(function ($stateProvider, ccTokenSecurityProvider) {
                $stateProvider.state('state1', {
                    url: '/state1',
                    access: 'ROLE_1'
                });
                $stateProvider.state('state2', {
                    url: '/state2',
                    access: 'ROLE_2'
                });
                $stateProvider.state('state3', {
                    url: '/state3'
                });
                ccTokenSecurityProvider.login({
                    state: 'overrideLogin',
                    templateUrl: 'test/views/login.html'
                });
                ccTokenSecurityProvider.requiresAuthentication();
                ccTokenSecurityProvider.accessForbidden({});
            });
        module('ccTokenSecurity', 'ccTokenSecurityTest');
        module('test/views/login.html');

        inject(function () {});
    });

    var user1 = {
        login: 'user1',
        email: 'user1@email.com',
        token: 'token1',
        roles: ['ROLE_1','ROLE_2']
    };

    var user2 = {
        login: 'user2',
        email: 'user2@email.com',
        token: 'token2',
        roles: ['ROLE_2']
    };

    var user3 = {
        login: 'user3',
        email: 'user3@email.com',
        token: 'token3',
        roles: []
    };


    describe('', function() {

        var scope, mockState, mockSession;

        beforeEach(inject(function(Session, $state, $rootScope) {
            scope = $rootScope.$new();
            mockState = $state;
            mockSession = Session;
        }));

        afterEach(function() {
            mockSession.invalidate();
        });

        it('should unauthenticated user be directed to (overridden) login state when trying to access protected resource', function(){
            // when
            scope.$apply(function(){
                mockState.go('state1');
            });
            // then
            expect(mockState.current.name).toBe('overrideLogin');
        });


        it('should unauthenticated user be directed to (overridden) login state when trying to access unprotected resource', function(){
            // when
            scope.$apply(function(){
                mockState.go('state3');
            });
            // then
            expect(mockState.current.name).toBe('overrideLogin');
        });


        it('should user with sufficient privileges be allowed to get to protected resource', function(){
            // given
            mockSession.create(user1);
            // when
            scope.$apply(function(){
                mockState.go('state1');
            });
            // then
            expect(mockState.current.name).toBe('state1');
        });

        it('should user with insufficient privileges be not allowed to get to protected resource', function(){
            // given
            mockSession.create(user2);
            // when
            scope.$apply(function(){
                mockState.go('state1');
            });
            // then
            expect(mockState.current.name).toBe('accessForbidden');
        });

        it('should authenticated user be allowed to get to unprotected resource', function(){
            // given
            mockSession.create(user2);
            // when
            scope.$apply(function(){
                mockState.go('state3');
            });
            // then
            expect(mockState.current.name).toBe('state3');
        });

        it('should authenticated user with no roles be allowed to get to unprotected resource', function(){
            // given
            mockSession.create(user3);
            // when
            scope.$apply(function(){
                mockState.go('state3');
            });
            // then
            expect(mockState.current.name).toBe('state3');
        });

    });
});
