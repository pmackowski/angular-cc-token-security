describe('module ccTokenSecurity: ', function(){

    beforeEach(function () {
        angular.module('ccTokenSecurityTest', function () {})
            .config(function ($stateProvider, ccTokenSecurityProvider) {
                $stateProvider.state('stateAfterLogout', {
                    url: '/stateAfterLogout'
                });
                ccTokenSecurityProvider.logout({
                    templateUrl: 'test/views/login.html',
                    nextState: 'stateAfterLogout'
                });
            });
        module('ccTokenSecurity', 'ccTokenSecurityTest');
        module('test/views/login.html');

        inject(function () {});
    });

    var user = {
        login: 'user1',
        email: 'user1@email.com',
        token: 'token1',
        roles: ['ROLE_USER']
    };

    describe('LogoutController', function() {

        var scope, mockState, mockSession;

        beforeEach(inject(function($controller, $rootScope, Session, $state) {
            scope = $rootScope.$new();
            mockState = $state;
            mockSession = Session;

            mockSession.create(user);

            $controller('LogoutController', {
                '$scope': scope
            });


        }));

        it('should invalidate session and go to "nextState" (here stateAfterLogout)', function(){
            // given
            scope.$apply();

            // then
            expect(mockSession.user()).toBeNull();
            expect(mockState.current.name).toBe('stateAfterLogout');
        });


    });

});