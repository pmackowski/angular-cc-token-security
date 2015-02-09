describe('module ccTokenSecurity: ', function(){

    beforeEach(function () {
        angular.module('ccTokenSecurityTest', function () {})
            .config(function ($stateProvider, ccTokenSecurityProvider) {
                $stateProvider.state('destinationStateBeforeLogin', {
                    url: '/destinationStateBeforeLogin'
                });
                $stateProvider.state('protectedDestinationStateBeforeLogin', {
                    url: '/protectedDestinationStateBeforeLogin',
                    access: 'ROLE_1'
                });
                $stateProvider.state('stateAfterLogin', {
                    url: '/stateAfterLogin'
                });
                ccTokenSecurityProvider.login({
                    templateUrl: 'test/views/login.html',
                    nextState: 'stateAfterLogin',
                    originalPath: true
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
        roles: ['ROLE_1']
    };

    var user2 = {
        login: 'user2',
        email: 'user2@email.com',
        token: 'token2',
        roles: ['ROLE_2']
    };


    describe('LoginController', function() {

        var scope, rootScope, mockState, mockSession;

        beforeEach(inject(function($controller, $rootScope, Session, $state, $resource, _$httpBackend_) {
            scope = $rootScope.$new();
            rootScope = $rootScope;
            mockState = $state;
            mockSession = Session;
            $httpBackend = _$httpBackend_;

            $controller('LoginController', {
                '$scope': scope
            });

        }));

        it('should login successfully and go to original path when user fill in correct credentials and originalPath is defined', function(){
            // given
            rootScope.originalPath = '/destinationStateBeforeLogin';
            scope.$apply();
            $httpBackend.expectPOST('authenticate?username=user&password=with_correct_password').respond(user2);

            // when
            scope.login('user','with_correct_password');
            $httpBackend.flush();

            // then
            expect(mockSession.user()).toEqual(user2);
            expect(mockSession.authToken()).toEqual('token2');

            expect(scope.$parent.currentUser).not.toBeNull();
            expect(mockState.current.name).toBe('destinationStateBeforeLogin');
        });


        it('should login successfully and go to nextState when user fill in correct credentials and originalPath is not defined', function(){
            // given
            scope.$apply();
            $httpBackend.expectPOST('authenticate?username=user&password=with_correct_password').respond(user2);

            // when
            scope.login('user','with_correct_password');
            $httpBackend.flush();

            // then
            expect(mockSession.user()).toEqual(user2);
            expect(mockSession.authToken()).toEqual('token2');

            expect(scope.$parent.currentUser).not.toBeNull();
            expect(mockState.current.name).toBe('stateAfterLogin');
        });

        it('should login successfully and go to protected original path when user has sufficient privileges', function(){
            // given
            rootScope.originalPath = '/protectedDestinationStateBeforeLogin';
            scope.$apply();
            $httpBackend.expectPOST('authenticate?username=user&password=with_correct_password').respond(user1);

            // when
            scope.login('user','with_correct_password');
            $httpBackend.flush();

            // then
            expect(mockSession.user()).toEqual(user1);
            expect(mockSession.authToken()).toEqual('token1');

            expect(scope.$parent.currentUser).not.toBeNull();
            expect(mockState.current.name).toBe('protectedDestinationStateBeforeLogin');
        });

        it('should login successfully and go to accessForbidden state when user has not sufficient privileges', function(){
            // given
            rootScope.originalPath = '/protectedDestinationStateBeforeLogin';
            scope.$apply();
            $httpBackend.expectPOST('authenticate?username=user&password=with_correct_password').respond(user2);

            // when
            scope.login('user','with_correct_password');
            $httpBackend.flush();

            // then
            expect(mockSession.user()).toEqual(user2);
            expect(mockSession.authToken()).toEqual('token2');

            expect(scope.$parent.currentUser).not.toBeNull();
            expect(mockState.current.name).toBe('accessForbidden');
        });

        it('should not login when user fill in incorrect credentials', function(){
            // given
            scope.$apply();

            $httpBackend.expectPOST('authenticate?username=user&password=with_wrong_credentials').respond(401, null);
            scope.login('user','with_wrong_credentials');
            $httpBackend.flush();

            // then
            expect(mockSession.user()).toBeNull();
            expect(mockSession.authToken()).toBeNull();
            expect(scope.authenticationError).toBeTruthy();
            expect(scope.tokenExpired).toBeFalsy();
        });

    });

});